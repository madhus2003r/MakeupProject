package com.atelier.config;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
@Configuration
public class SecurityConfig{
 @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }
 @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception{
  // CSRF is disabled for now: httpOnly SameSite=Lax session cookie + JSON-only API + same-origin proxy in dev.
  // Re-enable CSRF tokens (or use a double-submit header) before going live.
  http.csrf(c->c.disable())
   .cors(c->{})
   .authorizeHttpRequests(a->a
     .requestMatchers("/api/auth/**").permitAll()
     .requestMatchers("/api/admin/**").hasRole("ADMIN")
     .requestMatchers("/api/artist/**").hasRole("ARTIST")
     .anyRequest().authenticated())
   .exceptionHandling(e->e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));
  return http.build();
 }
 @Bean CorsConfigurationSource corsSource(@Value("${app.cors-origin}") String origin){
  CorsConfiguration c=new CorsConfiguration();
  c.setAllowedOrigins(List.of(origin)); c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE")); c.setAllowedHeaders(List.of("*")); c.setAllowCredentials(true);
  UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/api/**",c); return s;
 }
}
