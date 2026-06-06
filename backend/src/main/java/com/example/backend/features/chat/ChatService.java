package com.example.backend.features.chat;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.backend.features.chat.DTOs.ChatMessageDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendPrivateMessage(ChatMessageDTO dto) {
        ChatMessage entity = new ChatMessage();
        entity.setSender(dto.sender());
        entity.setRecipient(dto.recipient());
        entity.setContent(dto.content());
        chatRepository.save(entity);

        messagingTemplate.convertAndSendToUser(
            dto.recipient(),
            "/queue/messages",
            dto
        );
    }

    public List<ChatMessage> getHistory(String user1, String user2) {
        return chatRepository.findConversation(user1, user2);
    }
}
