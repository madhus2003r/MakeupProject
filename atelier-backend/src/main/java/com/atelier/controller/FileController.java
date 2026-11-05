package com.atelier.controller;
import com.atelier.entity.*;
import com.atelier.repository.*;
import com.atelier.exception.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
/** Artist ID photos and previous-work photos. Files are stored OUTSIDE the web root under random names and are served only to the owner or an admin. */
@RestController @RequestMapping("/api/files")
public class FileController{
 private static final Map<String,String> TYPES=Map.of("image/jpeg",".jpg","image/png",".png","image/webp",".webp");
 private static final long MAX=5L*1024*1024;
 private final FileRepo repo; private final Path dir;
 public FileController(FileRepo repo,@Value("${app.upload-dir}") String d) throws IOException{
  this.repo=repo; this.dir=Paths.get(d).toAbsolutePath().normalize(); Files.createDirectories(dir);
 }
 private static boolean has(Authentication a,String role){ return a.getAuthorities().stream().anyMatch(x->x.getAuthority().equals(role)); }
 private static boolean looksLikeImage(byte[] b){
  if(b.length<12) return false;
  boolean jpg=(b[0]&0xFF)==0xFF&&(b[1]&0xFF)==0xD8&&(b[2]&0xFF)==0xFF;
  boolean png=(b[0]&0xFF)==0x89&&b[1]=='P'&&b[2]=='N'&&b[3]=='G';
  boolean webp=b[0]=='R'&&b[1]=='I'&&b[2]=='F'&&b[3]=='F'&&b[8]=='W'&&b[9]=='E'&&b[10]=='B'&&b[11]=='P';
  return jpg||png||webp;
 }
 @PostMapping
 public Map<String,Object> upload(@RequestParam("file") MultipartFile f,@RequestParam("kind") String kind,Authentication auth) throws IOException{
  if(!has(auth,"ROLE_ARTIST")) throw new ApiException(403,"Only artists can upload these files.");
  String k=kind.toUpperCase();
  if(!k.equals("ID")&&!k.equals("PORTFOLIO")) throw new ApiException(400,"Invalid file type.");
  long owner=Long.parseLong(auth.getName());
  if(repo.countByOwnerIdAndKind(owner,k)>=(k.equals("ID")?2:8)) throw new ApiException(400,"Upload limit reached.");
  if(f.isEmpty()||f.getSize()>MAX) throw new ApiException(400,"Each image must be under 5 MB.");
  String ext=TYPES.get(f.getContentType()); byte[] data=f.getBytes();
  if(ext==null||!looksLikeImage(data)) throw new ApiException(400,"Only JPG, PNG or WebP images are allowed.");
  String stored=UUID.randomUUID()+ext; Files.write(dir.resolve(stored),data);
  StoredFile s=new StoredFile(); s.ownerId=owner; s.kind=k; s.originalName=f.getOriginalFilename(); s.storedName=stored; s.contentType=f.getContentType(); s.sizeBytes=f.getSize();
  repo.save(s);
  Map<String,Object> m=new HashMap<>(); m.put("id",s.id); return m;
 }
 @GetMapping("/{id}")
 public ResponseEntity<byte[]> get(@PathVariable Long id,Authentication auth) throws IOException{
  StoredFile s=repo.findById(id).orElseThrow(()->new ApiException(404,"File not found."));
  if(!has(auth,"ROLE_ADMIN")&&s.ownerId!=Long.parseLong(auth.getName())) throw new ApiException(403,"Not allowed.");
  byte[] b=Files.readAllBytes(dir.resolve(s.storedName));
  return ResponseEntity.ok().contentType(MediaType.parseMediaType(s.contentType)).header("X-Content-Type-Options","nosniff").header("Cache-Control","private, max-age=300").body(b);
 }
}
