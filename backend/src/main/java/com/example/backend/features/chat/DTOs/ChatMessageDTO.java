package com.example.backend.features.chat.DTOs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ChatMessageDTO(
  String sender,
  String recipient,
  String content,
  String timestamp
) {}
