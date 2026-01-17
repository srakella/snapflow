package com.snapflow.engine.controller;

import com.snapflow.engine.model.FormDefinition;
import com.snapflow.engine.repository.FormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*")
public class FormController {

    private final FormRepository formRepository;

    @Autowired
    public FormController(FormRepository formRepository) {
        this.formRepository = formRepository;
    }

    // Save a new form
    @PostMapping
    public ResponseEntity<FormDefinition> saveForm(@RequestBody FormDefinition form) {
        FormDefinition savedForm = formRepository.save(form);
        return ResponseEntity.ok(savedForm);
    }

    // Get all forms
    @GetMapping
    public List<FormDefinition> getAllForms() {
        return formRepository.findAll();
    }

    // Get form by ID
    @GetMapping("/{id}")
    public ResponseEntity<FormDefinition> getFormById(@PathVariable String id) {
        Optional<FormDefinition> form = formRepository.findById(id);
        return form.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
