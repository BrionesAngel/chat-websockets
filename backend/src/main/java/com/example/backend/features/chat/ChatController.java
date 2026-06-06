package com.example.backend.features.chat;

import java.security.Principal;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.backend.features.chat.DTOs.ChatMessageDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

  private final ChatService chatService;

  @MessageMapping("/chat.sendMessage")
  public void sendPrivateMessage(@Payload ChatMessageDTO message, Principal principal) {
    log.info("Mensaje recibido - principal: {}, mensaje: {}",
        principal != null ? principal.getName() : "NULL",
        message);

    if (principal == null) {
      log.error("Principal es null - token no válido o no enviado");
      return;
    }
    ChatMessageDTO secureMessage = new ChatMessageDTO(
        principal.getName(),
        message.recipient(),
        message.content(),
        message.timestamp());
    chatService.sendPrivateMessage(secureMessage);
  }

  @GetMapping("/api/chat/history/{otherUser}")
  public List<ChatMessage> getHistory(
      @PathVariable String otherUser,
      Principal principal) {
    List<ChatMessage> history = chatService.getHistory(
        principal.getName(),
        otherUser);
    return history;
  }
}
