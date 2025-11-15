# Reflexiones sobre Desarrollo con IA

**Proyecto ATS - Noviembre 2025**  
React • Node.js • PostgreSQL • Docker

---

## Cómo trabajo con IA

Mi forma de trabajar es bastante conversacional. No escribo prompts súper elaborados ni sigo scripts - simplemente le hablo a la IA como si fuera un compañero de equipo. Directo al punto.

Antes de empezar a codear, la IA me ayudó a crear los tickets del proyecto. Los definimos juntos, conversando sobre qué necesitaba el sistema. Una vez listos, los fui atacando uno por uno.

### Mi flujo de trabajo

1. **Implemento un ticket completo**
2. **Pruebo que funcione**
3. **Paso al siguiente**

**Lo más importante:** Un ticket a la vez. 
Ticket 1 → probar → Ticket 2 → probar → Ticket 3. Simple pero efectivo.

### La IA como asistente de pruebas

Una de las cosas más útiles: la IA me apoya activamente en las pruebas.

- "Lets test this project by running it via docker compose"
- "Ok I just added a new candidate, lets check if the candidate has a PDF"
- "Lets check if it worked"

Es como tener alguien que me ayuda a verificar cada paso. No solo escribe código, sino que me acompaña en el testing.

---

## Qué delego y qué no

**Le pido a la IA:**
- Crear los tickets del proyecto
- Implementar cada ticket completo
- Ayudarme a probar que todo funcione
- Corregir bugs que encuentro
- Configuraciones técnicas (Docker, database)

**Yo decido:**
- Qué ticket hacer ahora
- Si el resultado es aceptable
- Cuándo pasar al siguiente
- Qué funcionalidad tiene prioridad

---

## Testing iterativo entre tickets

Esta es la clave de todo: **probar entre cada ticket**.

**Mi patrón típico:**

```
Implementar Ticket 1 (Formulario de candidatos)
    ↓
"Lets test this" 
    ↓
Funciona? → Siguiente ticket
No funciona? → "I'm noticing that..." → Fix → Probar de nuevo
    ↓
Implementar Ticket 2 (Dashboard)
    ↓
"Ok, lets check if this works"
    ↓
Funciona? → Siguiente ticket
    ↓
...y así sucesivamente
```

Nunca avanzo sin estar seguro de que el ticket actual funciona. Esto me ha salvado de acumular bugs.

### Ejemplos reales

**Ticket 1 → Ticket 2:**
- Implementé el formulario
- "Lets test this project by running it via docker compose"
- Funcionó
- Pasé al dashboard

**Ticket 2 → Ticket 3:**
- Implementé el dashboard
- Probé agregar candidatos
- Noté problemas: "I'm noticing that we aren't giving a success message, we also aren't uploading the selected PDF"
- La IA lo arregló
- "Ok, I added the new candidate, lets check"
- Verificado → Siguiente ticket

---

## Comunicación directa

Mis prompts son conversacionales y directos:

- "Lets start by implementing ticket-1"
- "Lets remove the glow around the Add Candidate button"
- "Ok I just added a new candidate, lets check if the candidate has a PDF"

No necesito escribir ensayos. Le hablo como le hablaría a un colega: directo, claro, sin rodeos.

Cuando algo no funciona, simplemente le digo qué vi:
- "I'm noticing that we aren't giving a success message"
- "The PDF isn't uploading"

La IA entiende y arregla.

---

## Beneficios de este enfoque

### Un ticket a la vez

**Ventajas:**
- Problemas aislados → más fáciles de debuggear
- Verificación inmediata → menos bugs acumulados
- Progreso visible → motivación constante
- Rollback sencillo si algo falla

Si hubiera implementado todos los tickets juntos, cuando el PDF upload fallara, tendría que revisar todo el código para encontrar el problema. Así solo revisé el Ticket 1.

### Testing iterativo

**Ventajas:**
- Detecto problemas apenas surgen
- No acumulo deuda técnica
- Cada feature está verificada antes de seguir
- La IA me ayuda activamente en las pruebas

### Conversacional pero directo

**Ventajas:**
- Menos fricción → más productividad
- Comunicación natural → menos malentendidos
- Rápido → no pierdo tiempo elaborando prompts
- Efectivo → la IA entiende lo que necesito

---

## Qué aprendí sobre mí

**Soy metodológico**: Un ticket a la vez no es solo disciplina, es sentido común. Intentar hacer todo junto es una receta para el caos.

**Pruebo constantemente**: Entre cada ticket, verifico. No confío ciegamente. Esto me ha salvado múltiples veces.

**Me comunico simple**: No necesito prompts complejos. Directo funciona mejor.

**La IA es mi asistente de testing**: No solo para escribir código, sino para ayudarme a verificar que funcione.

**Priorizo bien**: Decidí implementar autenticación (Ticket 3) antes de corregir el upload, ya que no estaba seguro de la causa y no queria desviarme de sacar la funcionalidad principal. 

---

## Para mejorar

**Siguiente proyecto:**

1. **Seguir con un ticket a la vez**: Esto funciono bastante bien, y lo aplicare a futuro.

2. **Documentar cada ticket completado**: Un log rápido de qué funcionó y qué no.

3. **Pedir tests automatizados**: Además del testing manual, generar tests unitarios por ticket.

4. **Mantener el estilo conversacional**: Funciona. No cambiarlo.

---
## Otros
En general todo funciono bastante bien, no encontre ocasiones en la que la IA no me entendio. En cuanto a las desiciones tecnicas me fui por lo especificado y sugerido en la descripcion del trabajo, dado que mi conocimiento fullstack es limitado (vengo de C#/Unity). Me gusto el trabajar por tickets, de tal forma que la IA tenia un contexto de los objetivos que queria lograr desde un inicio, pero solo se trabajo un sector a la vez. Esto es similar a como trabajo con IA en el dia a dia, pero 

Nota: Le di formato MD a este documento con IA en base a mis notas, y fue traducido al español por la IA ya que acostrumbro trabajar en ingles.


## Conclusión

Mi enfoque es simple:

1. **Crear tickets claros** (con ayuda de la IA)
2. **Un ticket a la vez** (sin excepciones)
3. **Probar iterativamente** (entre cada ticket)
4. **Comunicación directa** (conversacional, sin fluff)
5. **La IA como asistente** (código + testing)

**Resultado:** Sistema completo, funcional, sin bugs acumulados, en menos tiempo.

La clave no es escribir prompts perfectos. La clave es:
- Saber qué hacer ahora
- Hacerlo completamente
- Verificar que funcione
- Pasar al siguiente

