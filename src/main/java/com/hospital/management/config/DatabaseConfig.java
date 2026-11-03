package com.hospital.management.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        String username = properties.getUsername();
        String password = properties.getPassword();

        if (url != null) {
            String raw = url;
            if (raw.startsWith("jdbc:")) {
                raw = raw.substring(5);
            }
            if (raw.startsWith("postgresql://") || raw.startsWith("postgres://")) {
                try {
                    URI uri = URI.create(raw);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        if (username == null || username.isBlank() || username.equals("sa")) {
                            username = parts[0];
                        }
                        if (password == null || password.isBlank()) {
                            password = parts[1];
                        }
                    }
                    String host = uri.getHost();
                    int port = uri.getPort();
                    String path = uri.getPath();
                    String query = uri.getQuery();

                    StringBuilder clean = new StringBuilder("jdbc:postgresql://").append(host);
                    if (port > 0) {
                        clean.append(":").append(port);
                    }
                    clean.append(path);
                    if (query != null && !query.isBlank()) {
                        clean.append("?").append(query);
                    } else {
                        clean.append("?sslmode=require");
                    }
                    url = clean.toString();
                } catch (Exception ignored) {
                }
            }
        }

        HikariDataSource ds = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();

        ds.setJdbcUrl(url);
        if (username != null && !username.isBlank()) {
            ds.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            ds.setPassword(password);
        }
        ds.setDriverClassName("org.postgresql.Driver");

        return ds;
    }
}

