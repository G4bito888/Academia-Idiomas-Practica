# Servicio Backend - Academia de Idiomas

Este repositorio contiene la implementación del servicio REST y GraphQL para el módulo de Registro, Cobro de Inscripción y Examen de Colocación.

## Enlaces Públicos
* **Servicio REST (POST):** `https://academia-idiomas-practica.onrender.com/api/alumnos`
* **Servicio GraphQL (Consultas):** `https://academia-idiomas-practica.onrender.com/graphql`

## 1. Documentación del Servicio REST (Crear Alumno)
Este endpoint procesa la inscripción, encripta el método de pago y genera credenciales temporales.

**Método:** `POST`
**Ruta:** `/api/alumnos`
**Headers:** `Content-Type: application/json`

**Body (JSON de ejemplo):**
json
{
  "nombres": "Senku",
  "apellidos": "Ishigami",
  "contacto": "senku@kingdomofscience.com",
  "recomendado_por": "Taiju Oki",
  "matricula_familiar": "",
  "idioma_nativo": "Japonés",
  "tarjeta_credito": "4152313456789102"
}

## 2. Documentación del Servicio GraphQL (Consultar Alumnos)
Permite consultar el catálogo de alumnos inscritos utilizando filtros dinámicos.

**Método:** `POST`
**Ruta:** `/graphql`

**Consulta (Query de ejemplo filtrando por idioma nativo):**
graphql
query {
  consultarAlumnos(idioma_nativo: "Japonés") {
    id
    nombre_completo
    nivel_asignado
    descuento_aplicable
    usuario
  }
}