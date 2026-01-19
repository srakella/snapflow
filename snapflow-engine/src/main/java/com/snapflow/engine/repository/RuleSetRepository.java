package com.snapflow.engine.repository;

import com.snapflow.engine.model.RuleSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RuleSetRepository extends JpaRepository<RuleSet, UUID> {

    Optional<RuleSet> findByName(String name);

    List<RuleSet> findByStatus(String status);

    List<RuleSet> findByCreatedBy(String createdBy);
}
