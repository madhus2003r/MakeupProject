package com.atelier.exception;
public class ApiException extends RuntimeException{ public final int status; public ApiException(int status,String msg){ super(msg); this.status=status; } }
