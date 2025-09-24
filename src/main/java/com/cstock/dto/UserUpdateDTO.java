package com.cstock.dto;

import java.time.LocalDate;

import com.cstock.domain.model.Position; 
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateDTO {
    
    @NotBlank(message = "Nome é obrigatório")
    private String userName;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    private String email;
    
    @NotNull(message = "Cargo é obrigatório")
    private Position position; 
    
    @NotNull(message = "Data de nascimento é obrigatória")
    @JsonFormat(pattern = "dd/MM/yyyy")
	@JsonProperty("birthDate")
    private LocalDate birthDate; 
    
    @Size(min = 6, max = 150, message = "A senha deve ter entre 6 e 150 caracteres")
    private String password; 

    public UserUpdateDTO() {}
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }
    
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}