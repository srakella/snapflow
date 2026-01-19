package com.snapflow.engine.repository;

import com.snapflow.engine.model.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserGroupRepository extends JpaRepository<UserGroup, String> {
    Optional<UserGroup> findByCode(String code);
}
