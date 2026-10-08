-- 家長端：列出已綁定的孩子、自己解除綁定（例如綁錯人、孩子已畢業）
create or replace function public.my_children()
returns table (student_id uuid, nickname text, linked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.student_id, p.nickname, l.created_at
  from public.parent_links l join public.profiles p on p.id = l.student_id
  where l.parent_id = auth.uid()
  order by l.created_at
$$;

create or replace function public.unlink_child(p_student uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from public.parent_links where parent_id = auth.uid() and student_id = p_student;
end $$;

revoke execute on function public.my_children(), public.unlink_child(uuid) from public, anon;
grant execute on function public.my_children(), public.unlink_child(uuid) to authenticated;
