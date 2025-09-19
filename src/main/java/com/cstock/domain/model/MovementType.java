package com.cstock.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum MovementType {
    EXIT,
    ENTRY;
    
    @JsonCreator
    public static MovementType fromString(String value) {
        return MovementType.valueOf(value.toUpperCase());
    }
}