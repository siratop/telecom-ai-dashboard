📡 Telecom AI Dashboard
Sistema integral de gestion de infraestructura de fibra optica, atencion al cliente automatizada con inteligencia artificial y monitoreo de metricas operativas en tiempo real.

📸 Capturas de Pantalla


🚀 Tecnologías y Herramientas Utilizadas
Framework Principal: Next.js (React 18)

Estilos y Diseño: Tailwind CSS

Iconografía: Lucide React

Mapas y Geolocalización: Leaflet & OpenStreetMap (Renderizado dinamico)

Inteligencia Artificial: Google Gemini AI (Procesamiento de lenguaje natural)

Automatizacion: n8n & Telegram Bot API (Chat en vivo y notificaciones)

APIs Externas: ve.dolarapi.com (Sincronización de tasas de cambio BCV)

Control de Versiones: Git y GitHub

🏗️ Arquitectura del Sistema
El proyecto sigue una arquitectura moderna orientada a eventos y microservicios, dividida en las siguientes capas funcionales:

Frontend (Capa de Presentacion): Desarrollado con Next.js y Tailwind CSS. Proporciona una Interfaz de Usuario (UI) reactiva para el monitoreo de metricas, gestion de infraestructura geolocalizada (Leaflet) y control del CRM. Preparado para su despliegue continuo en Vercel.

Backend y Persistencia (Capa de Datos): Soportado por Supabase (entorno Node.js) y PostgreSQL. Actúa como la fuente única de verdad (Single Source of Truth), gestionando de manera relacional los perfiles de clientes, coordenadas de fibra óptica y el almacenamiento persistente del historial de interacciones.

Orquestacion y Automatizacion (Capa de Integración): Se utiliza n8n como motor de flujos de trabajo. Se encarga de interceptar los Webhooks provenientes de la API de Telegram, rutear la información hacia la inteligencia artificial y devolver la respuesta al usuario final de forma asíncrona.

Inteligencia Artificial (Capa Cognitiva): Integración con Google Gemini para el Procesamiento de Lenguaje Natural (PLN). Su funcion es clasificar la intención del texto entrante (Ventas, Soporte Técnico, Consultas) y generar respuestas orgánicas.

⚙️ Requisitos Previos
Antes de descargar el codigo, asegúrate de tener instalado:

Node.js (Versión 18 o superior).

Git (Para clonar el repositorio).

Un Token de Telegram Bot (vía BotFather) para probar el modulo de chat.

🛠️ Instrucciones de Instalacion Local (Setup)
1. Clonar el repositorio
Abre una terminal y descarga el proyecto:


git clone https://github.com/TU_USUARIO/telecom-ai-dashboard.git
cd telecom-ai-dashboard
