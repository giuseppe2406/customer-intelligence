package de.bivona.customer_intelligence.service;

import de.bivona.customer_intelligence.model.AuthRequest;
import de.bivona.customer_intelligence.model.AuthResponse;
import de.bivona.customer_intelligence.model.User;
import de.bivona.customer_intelligence.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        // gleiche Fehlermeldung fuer unbekannten Benutzer und falsches Passwort,
        // damit niemand ueber die Antwort gueltige Benutzernamen erraten kann
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzername oder Passwort falsch"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzername oder Passwort falsch");
        }

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token);
    }
}
