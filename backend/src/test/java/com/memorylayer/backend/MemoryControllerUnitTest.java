package com.memorylayer.backend;

import com.memorylayer.backend.controller.MemoryController;
import com.memorylayer.backend.dto.MemoryDTO;
import com.memorylayer.backend.dto.MemoryRequestDTO;
import com.memorylayer.backend.service.AuthService;
import com.memorylayer.backend.service.JwtService;
import com.memorylayer.backend.service.MemoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = MemoryController.class)
class MemoryControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MemoryService memoryService;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    private MemoryDTO testMemory;
    private Principal testPrincipal;

    @BeforeEach
    void setUp() {
        testMemory = new MemoryDTO(
                "test-id-123",
                "Test Memory",
                "Test details",
                "learning",
                "USER_ADDED",
                true,
                false,
                1.0,
                "LOW",
                "ACTIVE",
                1,
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z"),
                0,
                "Test reason",
                null,
                "LOCAL_ONLY"
        );
        testPrincipal = () -> "user@example.com";
    }

    @Test
    void getAllMemories_returnsList() throws Exception {
        when(memoryService.getAllMemories("user-1")).thenReturn(List.of(testMemory));
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(get("/api/memories")
                .principal(testPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("test-id-123"))
                .andExpect(jsonPath("$[0].title").value("Test Memory"));
    }

    @Test
    void getMemoryById_returnsMemory() throws Exception {
        when(memoryService.getMemoryById("test-id-123", "user-1")).thenReturn(testMemory);
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(get("/api/memories/test-id-123")
                .principal(testPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("test-id-123"));
    }

    @Test
    void getMemoryById_notFound_returns404() throws Exception {
        when(memoryService.getMemoryById("nonexistent", "user-1"))
                .thenThrow(new com.memorylayer.backend.exception.ResourceNotFoundException("Memory not found with id: nonexistent"));
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(get("/api/memories/nonexistent")
                .principal(testPrincipal))
                .andExpect(status().isNotFound());
    }

    @Test
    void createMemory_returnsCreated() throws Exception {
        MemoryRequestDTO request = new MemoryRequestDTO(
                "New Memory",
                "New details",
                "learning",
                "USER_ADDED",
                true,
                false,
                1.0,
                "LOW",
                "ACTIVE",
                List.of(),
                "Test reason"
        );
        when(memoryService.createMemory(any(MemoryRequestDTO.class), anyString())).thenReturn(testMemory);
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(post("/api/memories")
                .principal(testPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Memory"));
    }

    @Test
    void createMemory_invalidTitle_returns400() throws Exception {
        MemoryRequestDTO request = new MemoryRequestDTO(
                "",
                "details",
                "learning",
                "USER_ADDED",
                true,
                false,
                1.0,
                "LOW",
                "ACTIVE",
                List.of(),
                "reason"
        );
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(post("/api/memories")
                .principal(testPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateMemory_returnsUpdated() throws Exception {
        MemoryRequestDTO request = new MemoryRequestDTO(
                "Updated Title",
                "Updated details",
                "learning",
                "USER_ADDED",
                true,
                false,
                1.0,
                "LOW",
                "ACTIVE",
                List.of(),
                "Updated reason"
        );
        when(memoryService.updateMemory(eq("test-id-123"), anyString(), any(MemoryRequestDTO.class))).thenReturn(testMemory);
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(put("/api/memories/test-id-123")
                .principal(testPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteMemory_returnsNoContent() throws Exception {
        doNothing().when(memoryService).deleteMemory("test-id-123", anyString());
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(delete("/api/memories/test-id-123")
                .principal(testPrincipal))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteMemory_notFound_returns404() throws Exception {
        doThrow(new com.memorylayer.backend.exception.ResourceNotFoundException("Memory not found"))
                .when(memoryService).deleteMemory("nonexistent", "user-1");
        when(authService.getUserByEmail("user@example.com")).thenReturn(new com.memorylayer.backend.dto.UserDTO("user-1", "user@example.com"));

        mockMvc.perform(delete("/api/memories/nonexistent")
                .principal(testPrincipal))
                .andExpect(status().isNotFound());
    }
}
