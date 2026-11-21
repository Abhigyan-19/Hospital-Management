package com.hospital.management.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hospital.management.security.UserAccount;
import jakarta.persistence.*;

@Entity
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    private String gender;
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_account_id")
    @JsonIgnore
    private UserAccount ownerAccount;

    @Column(name = "relationship_to_account", length = 100)
    private String relationshipToAccount;

    public Patient() {
    }

    public Patient(String name, int age, String gender, String phone) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserAccount getOwnerAccount() {
        return ownerAccount;
    }

    public void setOwnerAccount(UserAccount ownerAccount) {
        this.ownerAccount = ownerAccount;
    }

    public String getRelationshipToAccount() {
        return relationshipToAccount;
    }

    public void setRelationshipToAccount(String relationshipToAccount) {
        this.relationshipToAccount = relationshipToAccount;
    }
}