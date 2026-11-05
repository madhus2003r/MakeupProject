package com.atelier.serviceimpl;
import com.atelier.entity.*;
import com.atelier.repository.*;
import com.atelier.exception.ApiException;
import com.atelier.service.OtpService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class OtpServiceImpl implements OtpService{
 private static final Logger log=LoggerFactory.getLogger(OtpService.class);
 private final OtpRepo repo; private final PasswordEncoder enc; private final ObjectProvider<JavaMailSender> mail;
 @Value("${app.dev-otp-in-response}") private boolean devOtp;
 @Value("${app.mail-from}") private String from;
 public OtpServiceImpl(OtpRepo repo,PasswordEncoder enc,ObjectProvider<JavaMailSender> mail){ this.repo=repo; this.enc=enc; this.mail=mail; }

 /** Creates and sends a 6-digit OTP. Returns the code ONLY in dev mode (app.dev-otp-in-response=true). */
 @Transactional
 public String send(String email,String purpose){
  var last=repo.findFirstByEmailAndPurposeOrderByIdDesc(email,purpose);
  if(last.isPresent()&&last.get().createdAt.isAfter(LocalDateTime.now().minusSeconds(30))) throw new ApiException(429,"Please wait 30 seconds before requesting another OTP.");
  String code=String.format("%06d",new SecureRandom().nextInt(1_000_000));
  store(email,purpose,code,5);
  deliver(email,code);
  if(devOtp) log.info("DEV OTP for {} ({}): {}",email,purpose,code);
  return devOtp?code:null;
 }
 /** Stores a hashed secret (OTP or reset token) with an expiry. */
 @Transactional
 public void store(String email,String purpose,String secret,int minutes){
  repo.deleteByEmailAndPurpose(email,purpose);
  Otp o=new Otp(); o.email=email; o.purpose=purpose; o.codeHash=enc.encode(secret); o.expiresAt=LocalDateTime.now().plusMinutes(minutes);
  repo.save(o);
 }
 @Transactional(noRollbackFor=ApiException.class)
 public void verify(String email,String purpose,String code){
  Otp o=repo.findFirstByEmailAndPurposeOrderByIdDesc(email,purpose).orElseThrow(()->new ApiException(400,"Wrong OTP."));
  if(LocalDateTime.now().isAfter(o.expiresAt)){ repo.delete(o); throw new ApiException(400,"OTP expired. Please request a new one."); }
  if(o.attempts>=5){ repo.delete(o); throw new ApiException(400,"Too many wrong attempts. Please request a new OTP."); }
  if(code==null||!enc.matches(code,o.codeHash)){ o.attempts++; repo.save(o); throw new ApiException(400,"Wrong OTP."); }
  repo.delete(o);
 }
 private void deliver(String email,String code){
  JavaMailSender sender=mail.getIfAvailable();
  if(sender==null) {
   if(devOtp) return; // development mode exposes the OTP in the response/log.
   throw new ApiException(503,"Email delivery is not configured. Please contact support.");
  }
  try{
   SimpleMailMessage m=new SimpleMailMessage(); m.setFrom(from); m.setTo(email); m.setSubject("Your Atelier OTP"); m.setText("Your OTP is "+code+". It expires in 5 minutes. Do not share it.");
   sender.send(m);
   }catch(Exception e){
   log.error("Could not send OTP email: {}",e.getMessage());
   if(!devOtp) throw new ApiException(503,"Could not send the verification email. Please try again later.");
  }
 }
}
