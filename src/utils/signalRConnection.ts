import * as signalR from '@microsoft/signalr';

export const signalRConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${import.meta.env.VITE_BACKEND_URL}/hubs/thought`)
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();
