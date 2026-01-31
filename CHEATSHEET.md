#!/bin/bash

# 📋 Cheat Sheet - Commandes Essentielles
# Copier-coller prêt pour terminal

echo "🚀 AVENIR - Système de Notifications"
echo "=================================="
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 1: DÉMARRAGE DES SERVICES
# ═══════════════════════════════════════════════════════

echo "1️⃣  DÉMARRER LES SERVICES"
echo "═════════════════════════"
echo ""

echo "📦 Terminal 1 - Lancer PostgreSQL:"
echo "$ docker-compose up -d postgres"
echo ""

echo "🖥️  Terminal 2 - Lancer Express (Backend):"
echo "$ npm run dev:express"
echo ""

echo "⚛️  Terminal 3 - Lancer Next.js (Frontend):"
echo "$ cd infrastructure/next"
echo "$ npm run dev"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 2: CHARGER LES DONNÉES
# ═══════════════════════════════════════════════════════

echo "2️⃣  CHARGER LES DONNÉES DE TEST (optionnel)"
echo "═══════════════════════════════════════════"
echo ""

echo "📊 Charger les fixtures:"
echo "$ psql -U postgres -d avenir < infrastructure/database/fixtures/001_seed_notifications_activities.sql"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 3: ACCÈS DIRECTE
# ═══════════════════════════════════════════════════════

echo "3️⃣  ACCÈS AUX PAGES"
echo "═══════════════════"
echo ""

echo "🔗 Page Notifications:"
echo "   http://localhost:3000/notifications"
echo ""

echo "🔗 Page Activités:"
echo "   http://localhost:3000/activities"
echo ""

echo "🔗 Backend API:"
echo "   http://localhost:3001/api"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 4: TESTS API
# ═══════════════════════════════════════════════════════

echo "4️⃣  TESTER LES ENDPOINTS API"
echo "═════════════════════════════"
echo ""

echo "📥 Récupérer les notifications:"
echo '$ curl -X GET "http://localhost:3001/api/notifications" \'
echo '  -H "x-user-id: user-1"'
echo ""

echo "📨 Envoyer une notification:"
echo '$ curl -X POST "http://localhost:3001/api/notifications/send" \'
echo '  -H "x-user-id: user-1" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{
    "recipientUserId": "user-1",
    "title": "Test Notification",
    "message": "Ceci est un test",
    "type": "info"
  }'"'"''
echo ""

echo "✅ Marquer comme lue:"
echo '$ curl -X POST "http://localhost:3001/api/notifications/notif-2/read" \'
echo '  -H "x-user-id: user-1" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{}'"'"''
echo ""

echo "🗑️  Supprimer une notification:"
echo '$ curl -X DELETE "http://localhost:3001/api/notifications/notif-1" \'
echo '  -H "x-user-id: user-1"'
echo ""

echo "📊 Récupérer les activités:"
echo '$ curl -X GET "http://localhost:3001/api/activities" \'
echo '  -H "x-user-id: user-1"'
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 5: TEST SSE REAL-TIME
# ═══════════════════════════════════════════════════════

echo "5️⃣  TEST SSE (TEMPS RÉEL)"
echo "════════════════════════"
echo ""

echo "📡 Terminal 4 - Ouvrir stream notifications:"
echo '$ curl -N "http://localhost:3001/api/notifications/subscribe" \'
echo '  -H "x-user-id: user-1"'
echo ""

echo "📡 Terminal 5 - Ouvrir stream activités:"
echo '$ curl -N "http://localhost:3001/api/activities/subscribe" \'
echo '  -H "x-user-id: user-1"'
echo ""

echo "💡 Astuce: Envoyer une notification (voir section 4)"
echo "    Vous verrez l'événement SSE s'afficher EN TEMPS RÉEL!"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 6: INTÉGRATION FRONTEND
# ═══════════════════════════════════════════════════════

echo "6️⃣  INTÉGRATION FRONTEND"
echo "════════════════════════"
echo ""

echo "🔗 Ajouter dans la Navbar:"
echo ""

echo 'import Link from "next/link"'
echo ""

echo '<Link href="/notifications">📢 Notifications</Link>'
echo '<Link href="/activities">📊 Activités</Link>'
echo ""

echo ""

echo "🎨 Utiliser les composants:"
echo ""

echo '// Dans votre page/composant'
echo 'import { NotificationBell } from "@/components/atoms/NotificationBell"'
echo 'import { NotificationList } from "@/components/molecules/NotificationList"'
echo 'import { ActivityFeed } from "@/components/molecules/ActivityFeed"'
echo ""

echo '<NotificationBell />'
echo '<NotificationList />'
echo '<ActivityFeed limit={5} showRecent={true} />'
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 7: FICHIERS DE CONFIGURATION
# ═══════════════════════════════════════════════════════

echo "7️⃣  FICHIERS DE CONFIGURATION"
echo "═════════════════════════════"
echo ""

echo "📖 Documentation:"
echo "   - QUICK_START.md ............. Guide rapide (⭐⭐⭐)"
echo "   - USAGE_GUIDE.md ............. Guide d'utilisation"
echo "   - INTEGRATION_GUIDE.md ....... Guide technique"
echo "   - ARCHITECTURE.md ............ Diagrammes"
echo "   - SUMMARY.md ................. Résumé complet"
echo ""

echo "📝 Tests:"
echo "   - tests/api_tests.sh ......... Scripts curl"
echo ""

echo "💾 Données:"
echo "   - infrastructure/database/fixtures/001_seed_notifications_activities.sql"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 8: DÉPANNAGE
# ═══════════════════════════════════════════════════════

echo "8️⃣  DÉPANNAGE"
echo "═════════════"
echo ""

echo "❌ Erreur 'Connection refused' port 5432:"
echo "   → Vérifier Docker: docker ps"
echo "   → Lancer: docker-compose up -d postgres"
echo ""

echo "❌ Erreur 'Cannot GET /notifications':"
echo "   → Vérifier les pages créées"
echo "   → Vérifier le serveur Next.js (port 3000)"
echo ""

echo "❌ SSE ne fonctionne pas:"
echo "   → Vérifier Express s'exécute (port 3001)"
echo "   → Vérifier CORS"
echo "   → Consulter les logs du serveur"
echo ""

echo "❌ Pas de données:"
echo "   → Charger les fixtures (voir section 2)"
echo "   → Vérifier la base de données"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 9: QUICK TEST (30 SECONDES)
# ═══════════════════════════════════════════════════════

echo "9️⃣  QUICK TEST (30 SECONDES)"
echo "═════════════════════════════"
echo ""

echo "1. Démarrer les services (voir section 1)"
echo "2. Accéder à: http://localhost:3000/notifications"
echo "3. Charger les fixtures (voir section 2)"
echo "4. Ouvrir stream SSE dans un terminal (voir section 5)"
echo "5. Envoyer notification avec curl (voir section 4)"
echo "6. 🎉 Observer la notification EN TEMPS RÉEL!"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 10: PORTS ET URLS
# ═══════════════════════════════════════════════════════

echo "🔟 PORTS ET URLS"
echo "════════════════"
echo ""

echo "Frontend (Next.js):          http://localhost:3000"
echo "Backend (Express):           http://localhost:3001"
echo "Base de données (Postgres):  localhost:5432"
echo ""

echo "Endpoints API:"
echo "  - Notifications:  http://localhost:3001/api/notifications"
echo "  - Activités:      http://localhost:3001/api/activities"
echo ""

# ═══════════════════════════════════════════════════════
# SECTION 11: RACCOURCIS COMMANDES
# ═══════════════════════════════════════════════════════

echo "1️⃣1️⃣ RACCOURCIS COMMANDES"
echo "════════════════════════"
echo ""

echo "# Démarrer tout"
echo "docker-compose up -d postgres && npm run dev:express &"
echo ""

echo "# Lancer le test API"
echo "chmod +x tests/api_tests.sh && ./tests/api_tests.sh"
echo ""

echo "# Recharger la base"
echo "docker-compose down && docker-compose up -d postgres"
echo ""

echo "# Voir les logs"
echo "docker logs postgres"
echo "# ou"
echo "docker logs <container-id>"
echo ""

# ═══════════════════════════════════════════════════════
# FIN
# ═══════════════════════════════════════════════════════

echo ""
echo "✅ PRÊT À DÉMARRER!"
echo "=================="
echo ""
echo "Commencez par l'étape 1: Démarrer les services"
echo ""
echo "Besoin d'aide? Consultez les fichiers .md 📖"
echo ""
