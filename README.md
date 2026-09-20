# 📡 Telecom AI Dashboard 

Sistema integral de gestión de infraestructura de fibra optica, atencion al cliente automatizada con inteligencia artificial y monitoreo de métricas operativas en tiempo real.

## 🚀 Tecnologias y Herramientas Utilizadas

* **Framework Principal:** Next.js (React 18)
* **Estilos y Diseño:** Tailwind CSS
* **Iconografia:** Lucide React
* **Mapas y Geolocalización:** Leaflet & OpenStreetMap (Renderizado dinamico)
* **Inteligencia Artificial:** Google Gemini AI (Procesamiento de lenguaje natural)
* **Automatizacion:** n8n & Telegram Bot API (Chat en vivo y notificaciones)
* **APIs Externas:** ve.dolarapi.com (Sincronizacion de tasas de cambio BCV)
* **Control de Versiones:** Git y GitHub

## ⚙️ Requisitos Previos para el Equipo

Antes de descargar el código, asegúrate de tener instalado en tu PC:

1. [Node.js](https://nodejs.org/) (Versión 18 o superior).
2. [Git](https://git-scm.com/) (Para clonar y gestionar el repositorio).
3. [Visual Studio Code](https://code.visualstudio.com/) (Editor de código recomendado).
4. Tokens de acceso: Necesitaras un Token de **Telegram Bot** (vía BotFather) para probar el modulo de chat.

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura moderna orientada a eventos y microservicios (Serverless), dividida en las siguientes capas funcionales:

1. **Frontend (Capa de Presentacion):** Desarrollado con **Next.js** y **Tailwind CSS**. Proporciona una Interfaz de Usuario (UI) reactiva para el monitoreo de metricas, gestion de infraestructura geolocalizada (Leaflet) y control del CRM. Preparado para su despliegue continuo en **Vercel**.
2. **Backend y Persistencia (Capa de Datos):** Soportado por **Supabase** (entorno **Node.js**) y **PostgreSQL**. Actúa como la fuente unica de verdad (Single Source of Truth), gestionando de manera relacional los perfiles de clientes, coordenadas de fibra optica y el almacenamiento persistente del historial de interacciones.
3. **Orquestacion y Automatizacion (Capa de Integración):** Se utiliza **n8n** como motor de flujos de trabajo. Se encarga de interceptar los Webhooks provenientes de la API de Telegram, rutear la información hacia la inteligencia artificial y devolver la respuesta al usuario final de forma asincrona.
4. **Inteligencia Artificial (Capa Cognitiva):** Integracion con **Google Gemini** para el Procesamiento de Lenguaje Natural (PLN). Su funcion en la arquitectura es clasificar la intencion del texto entrante (Ventas, Soporte Tecnico, Consultas) y generar respuestas organicas basadas en el *System Prompt* definido en la configuracion.
5. **Servicios Externos:** Consumo de APIs publicas (DolarAPI) procesadas en el lado del cliente (Client-Side Rendering) para la conversion de divisas en tiempo real aplicada al analisis de costo-beneficio operativo.

## 🛠️ Instrucciones de Instalacion Local (Paso a Paso)

**1. Clonar el repositorio**

Abre una terminal y descarga el proyecto:

```bash
git clone [https://github.com/TU_USUARIO/telecom-ai-dashboard.git](https://github.com/TU_USUARIO/telecom-ai-dashboard.git)
cd telecom-ai-dashboard