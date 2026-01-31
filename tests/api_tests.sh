#!/bin/bash

# Scripts de test pour le système de notifications
# Assurez-vous que le serveur Express est en cours d'exécution sur http://localhost:3001

BASE_URL="http://localhost:3001/api"
USER_ID="user-1"
BEARER_TOKEN="your-bearer-token-here"  # À remplacer par un vrai token

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TEST DE L'API NOTIFICATIONS ===${NC}\n"

# Test 1: Récupérer les notifications
echo -e "${YELLOW}1. Récupérer les notifications${NC}"
curl -X GET "${BASE_URL}/notifications" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n${GREEN}✓ Test 1 complété${NC}\n"

# Test 2: Récupérer le compte non-lu
echo -e "${YELLOW}2. Récupérer le compte de notifications non-lues${NC}"
curl -X GET "${BASE_URL}/notifications/count" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n${GREEN}✓ Test 2 complété${NC}\n"

# Test 3: Marquer une notification comme lue
echo -e "${YELLOW}3. Marquer une notification comme lue${NC}"
NOTIFICATION_ID="notif-2"  # À remplacer par un vrai ID
curl -X POST "${BASE_URL}/notifications/${NOTIFICATION_ID}/read" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v

echo -e "\n${GREEN}✓ Test 3 complété${NC}\n"

# Test 4: Supprimer une notification
echo -e "${YELLOW}4. Supprimer une notification${NC}"
NOTIFICATION_ID="notif-1"  # À remplacer par un vrai ID
curl -X DELETE "${BASE_URL}/notifications/${NOTIFICATION_ID}" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n${GREEN}✓ Test 4 complété${NC}\n"

# Test 5: Envoyer une notification (nécessite le rôle bankAdvisor/bankManager)
echo -e "${YELLOW}5. Envoyer une notification${NC}"
curl -X POST "${BASE_URL}/notifications/send" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientUserId": "user-2",
    "title": "Test Notification",
    "message": "Ceci est un message de test",
    "type": "info"
  }' \
  -v

echo -e "\n${GREEN}✓ Test 5 complété${NC}\n"

# Test 6: Récupérer les activités
echo -e "${YELLOW}6. Récupérer les activités${NC}"
curl -X GET "${BASE_URL}/activities" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n${GREEN}✓ Test 6 complété${NC}\n"

# Test 7: Récupérer les activités récentes
echo -e "${YELLOW}7. Récupérer les activités récentes${NC}"
curl -X GET "${BASE_URL}/activities/recent?limit=5" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n${GREEN}✓ Test 7 complété${NC}\n"

# Test 8: Test SSE pour les notifications (requiert un terminal séparé)
echo -e "${YELLOW}8. Test SSE pour les notifications${NC}"
echo -e "Pour tester SSE, exécutez dans un terminal séparé:"
echo -e "curl -N \"${BASE_URL}/notifications/subscribe\" \\"
echo -e "  -H \"Authorization: Bearer ${BEARER_TOKEN}\" \\"
echo -e "  -H \"x-user-id: ${USER_ID}\"\n"

# Test 9: Test SSE pour les activités
echo -e "${YELLOW}9. Test SSE pour les activités${NC}"
echo -e "Pour tester SSE, exécutez dans un terminal séparé:"
echo -e "curl -N \"${BASE_URL}/activities/subscribe\" \\"
echo -e "  -H \"Authorization: Bearer ${BEARER_TOKEN}\" \\"
echo -e "  -H \"x-user-id: ${USER_ID}\"\n"

echo -e "${BLUE}=== TOUS LES TESTS TERMINÉS ===${NC}"
