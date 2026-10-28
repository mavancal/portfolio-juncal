import app from './app';

// Puerto configurado en .env o 3000 como valor por defecto
const PUERTO = Number(process.env.PORT ?? 3000);

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
  console.log(`Endpoint de salud: http://localhost:${PUERTO}/api/health`);
});
