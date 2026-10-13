package com.biolink.biolink.controller;

import com.biolink.biolink.config.JwtUtil;
import com.biolink.biolink.model.Usuario;
import com.biolink.biolink.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Solo un ADMIN autenticado puede crear cuentas nuevas (por eso "/api/auth/registro"
    // ya no está en la lista de rutas públicas de SecurityFilterConfig; sigue bajo
    // "/api/auth/**" pero ahora exige el mismo JWT que cualquier otro endpoint protegido).
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String username = credenciales.get("username");
        String password = credenciales.get("password");

        return usuarioRepository.findByUsername(username)
                .filter(usuario -> passwordEncoder.matches(password, usuario.getPassword()))
                .map(usuario -> {
                    String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().name());
                    return ResponseEntity.ok(Map.of("token", token));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas")));
    }
}
