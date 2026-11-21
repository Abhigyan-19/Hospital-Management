package com.hospital.management.repository;

import com.hospital.management.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByEntityOrderByTimestampDesc(String entity);

    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:entity IS NULL OR a.entity = :entity) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:fromTimestamp IS NULL OR a.timestamp >= :fromTimestamp) AND " +
           "(:toTimestamp IS NULL OR a.timestamp <= :toTimestamp) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findWithFilters(
            @Param("entity") String entity,
            @Param("action") String action,
            @Param("fromTimestamp") LocalDateTime fromTimestamp,
            @Param("toTimestamp") LocalDateTime toTimestamp
    );
}
