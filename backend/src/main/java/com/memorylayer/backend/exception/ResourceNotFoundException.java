package com.memorylayer.backend.exception;

/**
 * Exception thrown when a requested resource (e.g. a memory) cannot be found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
