package com.ace.userservice.ws;

import com.ace.userservice.entity.Role;
import com.ace.userservice.entity.User;
import com.ace.userservice.config.JwtUtils;
import com.ace.userservice.repository.RoleRepository;
import com.ace.userservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository ;
    @Autowired
    private JwtUtils jwtUtils;


    @PostMapping("/register")
    public String register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Convert roles (as strings) to Role entities and save them if they do not exist
        Set<Role> roleSet = new HashSet<>();
        for (Role role : user.getRoles()) {
            Role existingRole = roleRepository.findByName(role.getName());
            if (existingRole == null) {
                existingRole = roleRepository.save(new Role(role.getName()));
            }
            roleSet.add(existingRole);
        }
        user.setRoles(roleSet);

        userService.saveUser(user);
        return "User registered successfully!";
    }

    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        User user = userService.findByUsername(username);
        if (passwordEncoder.matches(password, user.getPassword())) {
            return jwtUtils.generateToken(username, user.getRoles());
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}
