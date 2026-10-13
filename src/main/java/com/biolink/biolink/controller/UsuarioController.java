package com.biolink.biolink.controller;

import com.biolink.biolink.model.Usuario;
import com.biolink.biolink.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestión de cuentas de usuario, solo para ADMIN: listar (sin exponer el
 * hash de la contraseña) y restablecer la contraseña de cualquier cuenta.
 * Crear usuarios sigue en AuthController (POST /api/auth/registro).
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Map<String, Object>> listar() {
        return usuarioRepository.findAll().stream()
                .map(this::aRespuesta)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> restablecerPassword(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevaPassword = body.get("password");
        if (nuevaPassword == null || nuevaPassword.length() < 4) {
            throw new RuntimeException("La contraseña debe tener al menos 4 caracteres");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con id " + id));

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada"));
    }

    private Map<String, Object> aRespuesta(Usuario usuario) {
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("id", usuario.getId());
        respuesta.put("username", usuario.getUsername());
        respuesta.put("rol", usuario.getRol());
        return respuesta;
    }
}
