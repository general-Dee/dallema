update shop_docs
set payload = jsonb_set(payload, '{settings,phone}', to_jsonb('+234 816 5510 842'::text), false),
    updated_at = now()
where key = 'catalog'
  and jsonb_typeof(payload->'settings') = 'object';
