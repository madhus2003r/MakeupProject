package com.atelier.dto;
import com.atelier.entity.User;
public record UserDto(String id,String name,String email,String phone,String address,String role){
 public static UserDto of(User u){ return new UserDto(String.valueOf(u.id),u.fullName,u.email,u.phone==null?"":u.phone,u.address==null?"":u.address,u.role.toLowerCase()); }
}
