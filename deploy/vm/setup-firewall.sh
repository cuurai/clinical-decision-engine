#!/bin/bash
# Firewall setup script for Clinical Decision Engine VM deployment
# Run this on the VM to open required ports

set -e

echo "🔥 Setting up firewall for Clinical Decision Engine..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Detect firewall type
if command -v ufw &> /dev/null; then
    echo "Detected UFW firewall"

    # Open required ports
    echo "Opening ports..."
    ufw allow 8081/tcp comment "Clinical Decision Engine - Dashboard"
    ufw allow 3100/tcp comment "Clinical Decision Engine - Decision Intelligence"
    ufw allow 3101/tcp comment "Clinical Decision Engine - Patient Clinical Data"
    ufw allow 3102/tcp comment "Clinical Decision Engine - Knowledge Evidence"
    ufw allow 3103/tcp comment "Clinical Decision Engine - Workflow Care Pathways"
    ufw allow 3104/tcp comment "Clinical Decision Engine - Integration Interoperability"
    ufw allow 5433/tcp comment "Clinical Decision Engine - PostgreSQL (if needed externally)"

    # Enable firewall if not already enabled
    ufw --force enable

    echo "✅ Firewall configured successfully"
    ufw status

elif command -v firewall-cmd &> /dev/null; then
    echo "Detected firewalld"

    # Open required ports
    firewall-cmd --permanent --add-port=8081/tcp
    firewall-cmd --permanent --add-port=3100/tcp
    firewall-cmd --permanent --add-port=3101/tcp
    firewall-cmd --permanent --add-port=3102/tcp
    firewall-cmd --permanent --add-port=3103/tcp
    firewall-cmd --permanent --add-port=3104/tcp
    firewall-cmd --permanent --add-port=5433/tcp

    # Reload firewall
    firewall-cmd --reload

    echo "✅ Firewall configured successfully"
    firewall-cmd --list-ports

elif command -v iptables &> /dev/null; then
    echo "Detected iptables"

    # Open required ports
    iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3100 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3101 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3102 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3103 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3104 -j ACCEPT
    iptables -A INPUT -p tcp --dport 5433 -j ACCEPT

    # Save rules (method depends on distribution)
    if command -v iptables-save &> /dev/null; then
        iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
        iptables-save > /etc/iptables.rules 2>/dev/null || \
        echo "⚠️  Please save iptables rules manually"
    fi

    echo "✅ Firewall configured successfully"
    iptables -L -n | grep -E "(8081|3100|3101|3102|3103|3104|5433)"

else
    echo "⚠️  No firewall detected (ufw, firewalld, or iptables)"
    echo "Please configure your firewall manually to open ports:"
    echo "  - 8081 (Dashboard)"
    echo "  - 3100-3104 (Services)"
    echo "  - 5433 (PostgreSQL, if needed externally)"
fi

echo ""
echo "📋 Ports that should be open:"
echo "  - 8081: Dashboard"
echo "  - 3100: Decision Intelligence"
echo "  - 3101: Patient Clinical Data"
echo "  - 3102: Knowledge Evidence"
echo "  - 3103: Workflow Care Pathways"
echo "  - 3104: Integration Interoperability"
echo "  - 5433: PostgreSQL (optional, for external access)"
