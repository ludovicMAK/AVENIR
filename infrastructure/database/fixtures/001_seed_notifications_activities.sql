-- Fixtures pour notifications et activités
-- À exécuter après la migration principale

-- Insérer quelques utilisateurs de test (si nécessaire)
INSERT INTO "users" (id, email, "firstName", "lastName", "phoneNumber", role, "createdAt", "updatedAt")
VALUES 
  ('user-1', 'alice@bank.com', 'Alice', 'Martin', '+33612345678', 'bankAdvisor', NOW(), NOW()),
  ('user-2', 'bob@bank.com', 'Bob', 'Dupont', '+33687654321', 'bankAdvisor', NOW(), NOW()),
  ('user-3', 'charlie@bank.com', 'Charlie', 'Laurent', '+33698765432', 'bankManager', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insérer des notifications de test (variées)
INSERT INTO notifications (id, "recipientUserId", "senderId", title, message, type, status, "createdAt", "updatedAt")
VALUES
  -- Notifications d'information
  ('notif-1', 'user-1', 'user-3', 'Mise à jour système', 'Une nouvelle version du système est disponible', 'info', 'read', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('notif-2', 'user-1', 'user-2', 'Nouveau message', 'Vous avez reçu un nouveau message d''un client', 'info', 'unread', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  
  -- Notifications d'avertissement
  ('notif-3', 'user-1', 'user-3', 'Action requise', 'Veuillez vérifier les documents en attente', 'warning', 'unread', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  ('notif-4', 'user-1', 'user-3', 'Limite dépassée', 'Un client a dépassé sa limite de découvert', 'warning', 'read', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  
  -- Notifications d'erreur
  ('notif-5', 'user-1', 'user-3', 'Erreur de transaction', 'Une transaction a échoué et nécessite votre attention', 'error', 'unread', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
  
  -- Notifications de news
  ('notif-6', 'user-1', 'user-2', 'Nouvelle fonctionnalité', 'Découvrez la nouvelle fonctionnalité de retraits programmés', 'news', 'read', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('notif-7', 'user-1', 'user-3', 'Taux d''intérêt mis à jour', 'Les taux d''intérêt ont été actualisés', 'news', 'unread', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

-- Insérer des activités de test (variées)
INSERT INTO activities (id, "userId", type, description, priority, metadata, "createdAt", "updatedAt")
VALUES
  -- Activités haute priorité
  ('activity-1', 'user-1', 'transaction', 'Virement de 5000€ vers le compte IBAN FR12345...', 'high', '{"amount": 5000, "currency": "EUR", "status": "completed"}', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  ('activity-2', 'user-1', 'account_update', 'Augmentation de la limite de découvert de 500€', 'high', '{"previousLimit": 500, "newLimit": 1000, "account": "Compte Courant"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  
  -- Activités priorité moyenne
  ('activity-3', 'user-1', 'login', 'Connexion depuis 192.168.1.100', 'medium', '{"ipAddress": "192.168.1.100", "device": "Chrome/Windows"}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('activity-4', 'user-1', 'profile_update', 'Mise à jour du numéro de téléphone', 'medium', '{"field": "phoneNumber", "previous": "+33612345678", "new": "+33687654321"}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  
  -- Activités basse priorité
  ('activity-5', 'user-1', 'view', 'Consultation du relevé de compte', 'low', '{"accountType": "current", "period": "january_2026"}', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  ('activity-6', 'user-1', 'notification_read', 'Lecture de notification', 'low', '{"notificationId": "notif-1", "type": "info"}', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  ('activity-7', 'user-1', 'export', 'Export de relevé en PDF', 'low', '{"format": "pdf", "accountId": "account-1", "size": "2.4MB"}', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  
  -- Activité credit
  ('activity-8', 'user-1', 'credit_request', 'Demande de crédit immobilier de 250000€', 'high', '{"creditType": "real_estate", "amount": 250000, "status": "pending_review"}', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
  
  -- Activité transfer
  ('activity-9', 'user-1', 'transfer_received', 'Réception de virement de 1500€ de Jean Dupont', 'medium', '{"amount": 1500, "senderName": "Jean Dupont", "reference": "Loyer Janvier"}', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours');

-- Vérifier les données insérées
SELECT COUNT(*) as notification_count FROM notifications;
SELECT COUNT(*) as activity_count FROM activities;
