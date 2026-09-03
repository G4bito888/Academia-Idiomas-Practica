const express = require('express');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexion a Supabase (Servicio que nos da Postgres en la nube)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
        rejectUnauthorized: false 
    } 
});

// Ruta base para que no salga el "Cannot GET /" en el navegador
app.get('/', (req, res) => res.send('Backend de la academia funcionando sin problemas'));

// 1. REST: INSCRIPCIONES (POST)
app.post('/api/alumnos', async (req, res) => {
    const { 
        nombres, 
        apellidos, 
        contacto, 
        recomendado_por, 
        matricula_familiar, 
        idioma_nativo, 
        tarjeta_credito 
    } = req.body;

    // Filtro rapido para que no manden peticiones vacias
    if (!nombres || !contacto || !idioma_nativo || !tarjeta_credito) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Hasheamos la tarjeta por seguridad y armamos credenciales temporales
    const tokenTarjeta = crypto.createHash('sha256').update(tarjeta_credito).digest('hex');
    const usuarioGenerado = `${nombres.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const passwordGenerado = crypto.randomBytes(4).toString('hex');
    const descuento = matricula_familiar ? true : false;
    const nombreCompleto = `${nombres} ${apellidos}`;

    try {
        const query = `
            INSERT INTO alumnos (nombre_completo, contacto, recomendado_por, matricula_familiar, descuento_aplicable, idioma_nativo, tarjeta_token, usuario, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nombre_completo, usuario, nivel_asignado;
        `;

        const values = [nombreCompleto, contacto, recomendado_por, matricula_familiar, descuento, idioma_nativo, tokenTarjeta, usuarioGenerado, passwordGenerado];
        const result = await pool.query(query, values);
        
        res.status(201).json({
            mensaje: "Inscripcion exitosa",
            alumno: result.rows[0]
        });
    } catch (error) {
        console.error("Fallo al insertar en BD:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 2. GRAPHQL: CONSULTAS CON FILTROS
const typeDefs = gql`
  type Alumno {
    id: ID!
    nombre_completo: String!
    idioma_nativo: String!
    nivel_asignado: String!
    descuento_aplicable: Boolean!
    usuario: String
  }

  type Query {
    consultarAlumnos(idioma_nativo: String, nivel_asignado: String): [Alumno]
  }
`;

const resolvers = {
  Query: {
    consultarAlumnos: async (_, args) => {
        let query = 'SELECT * FROM alumnos WHERE 1=1';
        let values = [];
        let count = 1;

        // Armamos el query dinamico dependiendo de que filtros manden
        if (args.idioma_nativo) {
            query += ` AND idioma_nativo = $${count}`;
            values.push(args.idioma_nativo);
            count++;
        }

        if (args.nivel_asignado) {
            query += ` AND nivel_asignado = $${count}`;
            values.push(args.nivel_asignado);
        }

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error("Fallo la consulta en GraphQL:", error);
            return [];
        }
    }
  }
};

// 3. LEVANTAR SERVICIOS
async function iniciarServidor() {
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`REST levantado en: http://localhost:${PORT}/api/alumnos`);
        console.log(`GraphQL levantado en: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
}

iniciarServidor();