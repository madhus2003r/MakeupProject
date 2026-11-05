package com.atelier.controller;
import com.atelier.entity.*;
import com.atelier.service.UserService;
import com.atelier.dto.UserDto;
import com.atelier.exception.ApiException;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
/** All founders are ADMIN with equal rights. Only an existing admin can add another (route is ADMIN-only in SecurityConfig). */
@RestController @RequestMapping("/api/admin")
public class AdminController{
 record AdminReq(String name,String email,String password){}
 private final UserService users; private final PasswordEncoder enc;
 public AdminController(UserService users,PasswordEncoder enc){ this.users=users; this.enc=enc; }
 @GetMapping("/admins") public List<UserDto> admins(){ return users.findByRole("ADMIN").stream().map(UserDto::of).toList(); }
 @PostMapping("/admins") public UserDto add(@RequestBody AdminReq r){
  String e=AuthController.em(r.email()); AuthController.email(e); AuthController.name(r.name()); AuthController.pw(r.password());
  if(users.existsByEmail(e)) throw new ApiException(409,"An account with this email already exists.");
  User u=new User(); u.fullName=r.name().trim(); u.email=e; u.passwordHash=enc.encode(r.password()); u.role="ADMIN";
  return UserDto.of(users.save(u));
 }
}
