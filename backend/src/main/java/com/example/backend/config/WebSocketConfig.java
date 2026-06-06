package com.example.backend.config;

import com.example.backend.features.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtService jwtService;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "/queue");
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/chat-websocket")
        .setAllowedOriginPatterns("*");
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new WebSocketInterceptor(jwtService));
  }

  public static class WebSocketInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public WebSocketInterceptor(JwtService jwtService) {
      this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
      StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

      StompCommand command = accessor.getCommand();
      if (command == null)
        return message;
      log.info("STOMP command: {}", command);

      if (StompCommand.CONNECT.equals(accessor.getCommand())) {
        String token = accessor.getFirstNativeHeader("Authorization");
        log.info("Token recibido: {}", token != null ? "presente" : "AUSENTE");

        if (token != null && token.startsWith("Bearer ")) {
          String jwt = token.substring(7);

          try {
            String username = jwtService.extractUsername(jwt);
            log.info("Username extraído: {}", username);

            if (username != null) {
              Authentication auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                  username, null, java.util.Collections.emptyList());

              accessor.setUser(auth);
              log.info("Principal seteado: {}", username);
            }
          } catch (Exception e) {
            log.error("Token inválido: {}", e.getMessage());
          }
        }
      }
      if (StompCommand.SEND.equals(command)) {
        log.info("SEND recibido - destination: {}, user: {}",
            accessor.getDestination(),
            accessor.getUser() != null ? accessor.getUser().getName() : "NULL");
      }

      return message;
    }
  }
}
