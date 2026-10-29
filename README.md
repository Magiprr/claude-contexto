# claude-contexto

Un mod para Claude Code que muestra siempre, sobre el cuadro de texto, cuánto
de la ventana de contexto lleva la sesión:

```
Contexto: 42% · 84k de 200k
```

Se pone amarillo desde el 50% y rojo desde el 80%. Antes de la primera
respuesta muestra una estimación (`~`), calculada como `/context` y sin
gastar llamadas a la API.

## Instalar

1. Clona el repo en tu carpeta de mods:

   ```bash
   git clone https://github.com/Magiprr/claude-contexto ~/.claude/mods/contexto
   ```

2. En `~/.claude/settings.json`, dentro de `"env"`, agrega la ruta completa a
   esa carpeta (cambia `TU_USUARIO` por el tuyo; en Windows usa la ruta de tu
   carpeta de usuario):

   ```json
   "env": {
     "CLAUDE_CODE_PLUGIN_DIRS": "/Users/TU_USUARIO/.claude/mods/contexto"
   }
   ```

   Si ya tienes otras carpetas en esa variable, sepáralas con `:`.

3. Reinicia Claude Code.

Solo lee el uso de contexto de la sesión; no envía nada a ninguna parte.
