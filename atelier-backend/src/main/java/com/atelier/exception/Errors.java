package com.atelier.exception;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
@RestControllerAdvice
public class Errors{
 @ExceptionHandler(ApiException.class) public ResponseEntity<Map<String,String>> api(ApiException e){ return ResponseEntity.status(e.status).body(Map.of("error",e.getMessage())); }
 @ExceptionHandler(MaxUploadSizeExceededException.class) public ResponseEntity<Map<String,String>> big(MaxUploadSizeExceededException e){ return ResponseEntity.badRequest().body(Map.of("error","Each image must be under 5 MB.")); }
 @ExceptionHandler(HttpMessageNotReadableException.class) public ResponseEntity<Map<String,String>> bad(HttpMessageNotReadableException e){ return ResponseEntity.badRequest().body(Map.of("error","Invalid request.")); }
}
