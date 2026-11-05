package com.atelier.controller;
import com.atelier.entity.*;
import com.atelier.repository.*;
import com.atelier.service.UserService;
import com.atelier.service.OtpService;
import com.atelier.dto.UserDto;
import com.atelier.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class AuthController{
 record StartReq(String email,String password,String role){}
 record VerifyReq(String email,String password,String role,String otp){}
 record EmailReq(String email){}
 record SignupReq(String name,String email,String phone,String password,String role,String otp){}
 record OtpReq(String email,String otp){}
 record ResetReq(String email,String token,String password){}
 record AdminReq(String name,String email,String password){}
 record ProfileReq(String name,String phone,String address){}
 private final UserService users; private final OtpService otp; private final PasswordEncoder enc;
 public AuthController(UserService users,OtpService otp,PasswordEncoder enc){ this.users=users; this.otp=otp; this.enc=enc; }

 static String em(String e){ return e==null?"":e.trim().toLowerCase(); }
 static void email(String e){ if(!e.matches("^\\S+@\\S+\\.\\S+$")) throw new ApiException(400,"Enter a valid email."); }
 static void pw(String p){ if(p==null||p.length()<8) throw new ApiException(400,"Password must be at least 8 characters."); }
 static void name(String n){ if(n==null||n.trim().isEmpty()) throw new ApiException(400,"Name is required."); }
 static void phone(String p){ if(p==null||!p.matches("^\\+?\\d[\\d\\s-]{8,13}$")) throw new ApiException(400,"Enter a valid phone number."); }
 static Map<String,Object> ok(String devCode){ Map<String,Object> m=new HashMap<>(); m.put("ok",true); if(devCode!=null) m.put("devCode",devCode); return m; }

 private User check(String email,String password,String role){
  User u=users.findByEmail(em(email)).orElse(null);
  if(u==null||password==null||!u.active||!enc.matches(password,u.passwordHash)) throw new ApiException(401,"Wrong email or password.");
  if(role==null||!u.role.equalsIgnoreCase(role)) throw new ApiException(400,"This is not a "+role+" account. Please choose the correct tab above.");
  return u;
 }
 private void session(User u,HttpServletRequest req,HttpServletResponse res){
  if(req.getSession(false)!=null) req.changeSessionId();
  var auth=new UsernamePasswordAuthenticationToken(String.valueOf(u.id),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.role)));
  SecurityContext ctx=SecurityContextHolder.createEmptyContext(); ctx.setAuthentication(auth); SecurityContextHolder.setContext(ctx);
  new HttpSessionSecurityContextRepository().saveContext(ctx,req,res);
 }
 private User create(String name,String email,String phone,String password,String role){
  User u=new User(); u.fullName=name.trim(); u.email=email; u.phone=phone; u.passwordHash=enc.encode(password); u.role=role; return users.save(u);
 }

 // ---- sign in: step 1 checks email + password + role and sends an OTP; step 2 verifies the OTP and starts the session
 @PostMapping("/auth/login/start") public Map<String,Object> loginStart(@RequestBody StartReq r){ User u=check(r.email(),r.password(),r.role()); return ok(otp.send(u.email,"login")); }
 @PostMapping("/auth/login/verify") public UserDto loginVerify(@RequestBody VerifyReq r,HttpServletRequest req,HttpServletResponse res){
  User u=check(r.email(),r.password(),r.role()); otp.verify(u.email,"login",r.otp()); session(u,req,res); return UserDto.of(u);
 }
 // ---- sign up (customer or artist)
 @PostMapping("/auth/signup/start") public Map<String,Object> signupStart(@RequestBody EmailReq r){
  String e=em(r.email()); email(e);
  if(users.existsByEmail(e)) throw new ApiException(409,"An account with this email already exists. Please sign in.");
  return ok(otp.send(e,"signup"));
 }
 @PostMapping("/auth/signup/verify") public UserDto signupVerify(@RequestBody SignupReq r,HttpServletRequest req,HttpServletResponse res){
  String e=em(r.email()); email(e); name(r.name()); phone(r.phone()); pw(r.password());
  String role=r.role()==null?"":r.role().toUpperCase();
  if(!role.equals("CUSTOMER")&&!role.equals("ARTIST")) throw new ApiException(400,"Invalid account type.");
  if(users.existsByEmail(e)) throw new ApiException(409,"An account with this email already exists. Please sign in.");
  otp.verify(e,"signup",r.otp());
  User u=create(r.name(),e,r.phone(),r.password(),role); session(u,req,res); return UserDto.of(u);
 }
 // ---- forgot password: email -> OTP -> one-time reset token -> new password
 @PostMapping("/auth/forgot") public Map<String,Object> forgot(@RequestBody EmailReq r){
  String e=em(r.email()); email(e);
  return ok(users.existsByEmail(e)?otp.send(e,"reset"):null); // same answer whether or not the account exists
 }
 @PostMapping("/auth/reset/verify") public Map<String,Object> resetVerify(@RequestBody OtpReq r){
  String e=em(r.email()); otp.verify(e,"reset",r.otp());
  byte[] b=new byte[32]; new SecureRandom().nextBytes(b); String token=Base64.getUrlEncoder().withoutPadding().encodeToString(b);
  otp.store(e,"resettoken",token,10);
  Map<String,Object> m=new HashMap<>(); m.put("token",token); return m;
 }
 @PostMapping("/auth/reset") public Map<String,Object> reset(@RequestBody ResetReq r){
  String e=em(r.email()); pw(r.password()); otp.verify(e,"resettoken",r.token());
  User u=users.findByEmail(e).orElseThrow(()->new ApiException(400,"Could not reset the password."));
  u.passwordHash=enc.encode(r.password()); users.save(u); return ok(null);
 }
 // ---- first founder admin (only while no admin exists), session, profile
 @GetMapping("/auth/setup-needed") public Map<String,Object> setupNeeded(){ Map<String,Object> m=new HashMap<>(); m.put("needed",!users.existsByRole("ADMIN")); return m; }
 @PostMapping("/auth/setup-admin") public UserDto setupAdmin(@RequestBody AdminReq r,HttpServletRequest req,HttpServletResponse res){
  if(users.existsByRole("ADMIN")) throw new ApiException(403,"Setup is already complete.");
  String e=em(r.email()); email(e); name(r.name()); pw(r.password());
  if(users.existsByEmail(e)) throw new ApiException(409,"An account with this email already exists.");
  User u=create(r.name(),e,null,r.password(),"ADMIN"); session(u,req,res); return UserDto.of(u);
 }
 @PostMapping("/auth/logout") public Map<String,Object> logout(HttpServletRequest req){
  HttpSession s=req.getSession(false); if(s!=null) s.invalidate(); SecurityContextHolder.clearContext(); return ok(null);
 }
 @GetMapping("/me") public UserDto me(Principal p){ return UserDto.of(load(p)); }
 @PutMapping("/me") public UserDto updateMe(Principal p,@RequestBody ProfileReq r){
  User u=load(p); name(r.name()); u.fullName=r.name().trim();
  if(r.phone()!=null&&!r.phone().isBlank()){ phone(r.phone()); u.phone=r.phone(); }
  u.address=r.address(); return UserDto.of(users.save(u));
 }
 private User load(Principal p){ return users.findById(Long.valueOf(p.getName())).orElseThrow(()->new ApiException(401,"Please sign in.")); }
}
