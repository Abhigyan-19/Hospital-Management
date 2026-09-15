package com.hospital.management.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
// this class represents the database entity.
// this package is not mandatory for JPA itslef. but it is a good way to organize the project


//JPA => jakarta persistence API
// it helps java opjects interact with relational databases.
@Entity
public class Patient {
// this tekks JPA : treat the Patient class as a persistent entity that can be stored in the database.
// A class is not automatically a database table...
// the @Entity annotation tells JPA to manage it as one.

    @Id // this tells JPA that the field is the primary key of the entity.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // this tells JPA to use a generated value for the ID.
    private Long id;

    private String name;

    private int age;

    private String gender;

    private String phone;

    public Patient() { // no argument constructor... it creates a Patient Objext without requiring any values.
    }
// This constructor allows us to create a patient with values.
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

}