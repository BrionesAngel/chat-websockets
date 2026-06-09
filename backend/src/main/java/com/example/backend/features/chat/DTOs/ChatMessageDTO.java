package com.example.backend.features.chat.DTOs;

public record ChatMessageDTO(
  String sender,
  String recipient,
  String content,
  String timestamp
) {}
