🗄️ Documentación de la Base de Datos (Supabase / PostgreSQL)
Este documento detalla la estructura relacional de la base de datos alojada en Supabase (PostgreSQL), diseñada para soportar tanto la gestion de infraestructura de fibra optica (mapas geolocalizados) como el modulo automatizado de atención al cliente (chatbot Telegram + IA).

1. Modulo de Atención al Cliente e Inteligencia Artificial
Estas tablas gestionan las interacciones con los usuarios de Telegram, el control de estados de venta/soporte y las metricas de consumo de tokens.

Tabla: chat_conversaciones
Almacena la sesion principal de cada usuario, su estado actual y el acumulado de costos/tokens consumidos.

chat_id (Text, Primary Key): Identificador único del chat de Telegram.

nombre_usuario (Text): Nombre o alias de Telegram del cliente.

estado (Text): Estado del ciclo de vida del cliente. Valores: 'activo', 'exitoso' (retenido), 'perdido' (abandono).

tokens_usados (Integer): Suma total de tokens consumidos por Gemini IA en esta conversación.

costo_usd (Decimal 10,4): Costo estimado acumulado en dólares.

ultima_interaccion (Timestampz): Fecha y hora del último mensaje para medir inactividad.

Tabla: chat_mensajes
Registra el historial detallado de mensajes dentro de cada conversación para alimentar el contexto del bot y auditar el soporte.

id (BigInt / UUID, Primary Key): Identificador único del mensaje.

chat_id (Text, Foreign Key): Relacionado con chat_conversaciones(chat_id).

emisor (Text): Quién envio el mensaje. Valores: 'cliente', 'bot', 'admin'.

texto (Text): Contenido íntegro del mensaje.

hora (Text): Hora formateada (ej. "10:30 AM") para visualización rapida en UI.

created_at (Timestampz): Marca de tiempo real de creación en la base de datos.

Tabla: reportes_ia
Almacena los informes gerenciales generados asíncronamente por n8n + Gemini.

id (UUID, Primary Key): Identificador del reporte.

reporte_texto (Text): Contenido estructurado del analisis operativo.

solicitado_por (Text): Entidad que solicitó el reporte (ej. 'admin').

created_at (Timestampz): Fecha de emisión del informe.

2. Módulo de Infraestructura Geográfica (GIS - Mapas)
Estas tablas controlan la red física de telecomunicaciones y su renderizado en el mapa mediante Leaflet.

Tabla: mapa_nodos
Representa los puntos centrales de distribución (OLT / Data Centers).

id (UUID, Primary Key): Identificador único del nodo.

nombre (Text): Nombre identificador (ej. "Nodo Central Alta Vista").

latitud (Float): Coordenada GPS Y.

longitud (Float): Coordenada GPS X.

capacidad_puertos (Integer): Número maximo de conexiones soportadas.

estado (Text): 'Operativo', 'En Mantenimiento', 'Caído'.

Tabla: mapa_postes
Registra el tendido aéreo y la ubicación de las cajas NAP (Network Access Point).

id (UUID, Primary Key): Identificador unico del poste.

nodo_id (UUID, Foreign Key): Relacionado con mapa_nodos(id). Define de qué nodo se alimenta este poste.

codigo_poste (Text): Serial o código físico (ej. "P-UA-001").

latitud (Float): Coordenada GPS Y.

longitud (Float): Coordenada GPS X.

tiene_caja_nap (Boolean): true si el poste tiene una caja de distribución para conectar clientes.

Tabla: mapa_clientes
Mapea la ubicación exacta de las instalaciones de los clientes finales.

id (UUID, Primary Key): Identificador único del cliente.

nombre (Text): Nombre del titular del contrato.

poste_id (UUID, Foreign Key): Relacionado con mapa_postes(id). Indica a que poste/caja NAP está físicamente conectado el cliente.

latitud (Float): Coordenada GPS Y (Vivienda/Local).

longitud (Float): Coordenada GPS X (Vivienda/Local).

plan_contratado (Text): Ej. "Fibra 100 Mbps".

estado_servicio (Text): 'Activo', 'Suspendido', 'Corte por falla'.

Tabla: mapa_rutas
Define los polígonos o líneas de conexión (cableado de fibra óptica) entre puntos para dibujarlos en el mapa.

id (UUID, Primary Key): Identificador unico del tramo de fibra.

origen_id (UUID): ID del punto de inicio (puede ser un Nodo o un Poste).

destino_id (UUID): ID del punto final.

tipo_cable (Text): Especificación técnica (ej. "Manga 48 Hilos", "Drop").

distancia_metros (Float): Longitud estimada del tendido.

3. Modelo Relacional y Arquitectura de Datos
La base de datos sigue un esquema altamente relacional diseñado para asegurar la integridad referencial y facilitar consultas espaciales y analíticas:

Topología de Red (De mayor a menor):

Un Nodo (mapa_nodos) alimenta a múltiples Postes (mapa_postes). Esta es una relación de 1 a Muchos (1:N) a traves de nodo_id.

Un Poste alimenta a multiples Clientes (mapa_clientes). Relación de 1 a Muchos (1:N) a traves de poste_id.

Esta estructura en cascada permite trazar fallas masivas. Si un Nodo cambia su estado a "Caído", el sistema puede deducir instantáneamente qué postes y que clientes se quedan sin servicio.

Auditoría de Chatbot:

Una Conversación (chat_conversaciones) contiene multiples Mensajes (chat_mensajes). Relación de 1 a Muchos (1:N) vinculada por chat_id.

Esto permite escalar el sistema a futuro: si un cliente en el mapa (mapa_clientes) asocia su numero de Telegram, se puede crear un JOIN entre chat_conversaciones y mapa_clientes para vincular automaticamente los reportes de falla del chatbot con las coordenadas físicas del usuario.