## Client Gateway

Es el punto de comunicacion entre nuestros clientes y nuestros servicios.
Es el encargado de recibir las peticiones, enviarlas a los servicios correspondientes y devolver las respuestas al cliente.

## DEV

1. Clonar el respositorio
2. Instalar dependecias
3. Crear un archivo '.env' basada en el '.env.template'
4. Levantar el servidor de NATS

`docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats`

5. Tener levantadis los microservicios que se van a consumir
6. levantar proyecto con `npm run start:dev`

## NATS

`docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats`
