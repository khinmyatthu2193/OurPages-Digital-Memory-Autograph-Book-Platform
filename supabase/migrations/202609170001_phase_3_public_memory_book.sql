-- Keep the database constraint aligned with the public API's guest-message limit.
alter table public.memories
  drop constraint if exists memories_message_check;

alter table public.memories
  alter column message type varchar(2000);

alter table public.memories
  add constraint memories_message_check
  check (char_length(trim(message)) between 1 and 2000);
