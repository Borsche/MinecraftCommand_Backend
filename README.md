# MinecraftCommand_Backend

## Settings

requires a settings.json at the root directory  
it should look like this  

```
{
    host: 'ip',
    port: port,
    password: 'password'
}
```  
  
Take a look at example.settings.json for an example


## Eventtext

You can specify the text posted at every event in eventtext.json.
You can also access the variables specified in the RequestInfo Interface by appending a '@' before the variable name. 
