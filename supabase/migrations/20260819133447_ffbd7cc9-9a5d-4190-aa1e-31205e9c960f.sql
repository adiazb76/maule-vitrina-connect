
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','emprendedor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'emprendedor') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES / COMUNAS
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

CREATE TABLE public.comunas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  region text NOT NULL DEFAULT 'Maule',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comunas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comunas TO authenticated;
GRANT ALL ON public.comunas TO service_role;
ALTER TABLE public.comunas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunas public read" ON public.comunas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage comunas" ON public.comunas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ENTREPRENEURS
CREATE TYPE public.entrepreneur_status AS ENUM ('pendiente','aprobado','rechazado');

CREATE TABLE public.entrepreneurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  slug text NOT NULL UNIQUE,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  comuna_id uuid REFERENCES public.comunas(id) ON DELETE SET NULL,
  short_description text NOT NULL DEFAULT '',
  about text,
  value_prop text,
  photo_url text,
  logo_url text,
  tags text[] NOT NULL DEFAULT '{}',
  phone text,
  whatsapp text,
  whatsapp_message text,
  email text,
  instagram text,
  facebook text,
  website text,
  collaboration_seeking text,
  collaboration_offering text,
  status public.entrepreneur_status NOT NULL DEFAULT 'pendiente',
  featured boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  contacts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX entrepreneurs_status_idx ON public.entrepreneurs(status);
CREATE INDEX entrepreneurs_category_idx ON public.entrepreneurs(category_id);
CREATE INDEX entrepreneurs_comuna_idx ON public.entrepreneurs(comuna_id);
GRANT SELECT ON public.entrepreneurs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entrepreneurs TO authenticated;
GRANT ALL ON public.entrepreneurs TO service_role;
ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER entrepreneurs_updated BEFORE UPDATE ON public.entrepreneurs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "approved entrepreneurs public" ON public.entrepreneurs FOR SELECT TO anon, authenticated USING (status = 'aprobado');
CREATE POLICY "owners read own" ON public.entrepreneurs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all entrepreneurs" ON public.entrepreneurs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners insert own" ON public.entrepreneurs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners update own" ON public.entrepreneurs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage entrepreneurs" ON public.entrepreneurs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id uuid NOT NULL REFERENCES public.entrepreneurs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  info text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_entrepreneur_idx ON public.products(entrepreneur_id);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.entrepreneurs e WHERE e.id = entrepreneur_id AND e.status = 'aprobado'));
CREATE POLICY "owners read own products" ON public.products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.entrepreneurs e WHERE e.id = entrepreneur_id AND e.user_id = auth.uid()));
CREATE POLICY "owners manage own products" ON public.products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.entrepreneurs e WHERE e.id = entrepreneur_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.entrepreneurs e WHERE e.id = entrepreneur_id AND e.user_id = auth.uid()));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  image_url text,
  starts_at timestamptz NOT NULL,
  location text,
  organizer text,
  registration_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RADIO CONTENT
CREATE TABLE public.radio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'programa',
  description text,
  image_url text,
  media_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.radio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radio_items TO authenticated;
GRANT ALL ON public.radio_items TO service_role;
ALTER TABLE public.radio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "radio public read" ON public.radio_items FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage radio" ON public.radio_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ENTREPRENEUR OF THE WEEK
CREATE TABLE public.weekly_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id uuid NOT NULL REFERENCES public.entrepreneurs(id) ON DELETE CASCADE,
  week_start date NOT NULL UNIQUE,
  story text,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.weekly_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_features TO authenticated;
GRANT ALL ON public.weekly_features TO service_role;
ALTER TABLE public.weekly_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly public read" ON public.weekly_features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage weekly" ON public.weekly_features FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ANALYTICS
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id uuid NOT NULL REFERENCES public.entrepreneurs(id) ON DELETE CASCADE,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interactions_entrepreneur_idx ON public.interactions(entrepreneur_id, kind);
GRANT INSERT ON public.interactions TO anon, authenticated;
GRANT SELECT ON public.interactions TO authenticated;
GRANT ALL ON public.interactions TO service_role;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log interactions" ON public.interactions FOR INSERT TO anon, authenticated WITH CHECK (kind IN ('view','whatsapp','instagram','facebook','website','email','phone'));
CREATE POLICY "owners read own interactions" ON public.interactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.entrepreneurs e WHERE e.id = entrepreneur_id AND e.user_id = auth.uid()));
CREATE POLICY "admins read interactions" ON public.interactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.log_interaction(_entrepreneur_id uuid, _kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _kind NOT IN ('view','whatsapp','instagram','facebook','website','email','phone') THEN RETURN; END IF;
  INSERT INTO public.interactions (entrepreneur_id, kind) VALUES (_entrepreneur_id, _kind);
  IF _kind = 'view' THEN
    UPDATE public.entrepreneurs SET views = views + 1 WHERE id = _entrepreneur_id;
  ELSE
    UPDATE public.entrepreneurs SET contacts = contacts + 1 WHERE id = _entrepreneur_id;
  END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.log_interaction(uuid, text) TO anon, authenticated;

-- SEED
INSERT INTO public.categories (name, slug, sort_order) VALUES
 ('Gastronomía','gastronomia',1),('Agricultura','agricultura',2),('Comercio','comercio',3),
 ('Servicios profesionales','servicios-profesionales',4),('Turismo','turismo',5),('Artesanía','artesania',6),
 ('Belleza','belleza',7),('Salud y bienestar','salud-y-bienestar',8),('Tecnología','tecnologia',9),
 ('Educación','educacion',10),('Transporte','transporte',11),('Construcción','construccion',12),
 ('Diseño','diseno',13),('Moda','moda',14),('Hogar','hogar',15),('Otros','otros',16);

INSERT INTO public.comunas (name, slug) VALUES
 ('Linares','linares'),('Longaví','longavi'),('Parral','parral'),('Retiro','retiro'),
 ('Villa Alegre','villa-alegre'),('Yerbas Buenas','yerbas-buenas'),('Colbún','colbun'),
 ('San Javier','san-javier'),('Cauquenes','cauquenes'),('Chanco','chanco'),('Pelluhue','pelluhue');

INSERT INTO public.entrepreneurs (slug, business_name, owner_name, category_id, comuna_id, short_description, about, value_prop, photo_url, tags, whatsapp, email, instagram, website, status, featured, views, contacts)
SELECT v.slug, v.business_name, v.owner_name, c.id, m.id, v.short_description, v.about, v.value_prop,
       'https://picsum.photos/seed/' || v.slug || '/1200/800', v.tags, v.whatsapp, v.email, v.instagram, v.website, 'aprobado', v.featured, v.views, v.contacts
FROM (VALUES
 ('sabores-del-maule','Sabores del Maule','Carolina Muñoz','Gastronomía','Linares','Cocina casera y conservas artesanales hechas con productos de la zona.','Partimos en la cocina de casa preparando mermeladas para la feria y hoy abastecemos a cafeterías de Linares y Parral. Trabajamos solo con fruta de temporada comprada a productores vecinos.','Sabor de campo, hecho a mano y con trazabilidad local.',ARRAY['mermeladas','conservas','delivery'],'56912340001','contacto@saboresdelmaule.cl','@saboresdelmaule','https://saboresdelmaule.cl',true,412,38),
 ('miel-los-robles','Miel Los Robles','Jorge Sepúlveda','Agricultura','Longaví','Miel multifloral y productos apícolas de colmenas del secano.','Tres generaciones cuidando abejas en Longaví. Producimos miel, polen y propóleo con manejo responsable y polinizamos huertos de la zona.','Miel pura, sin mezclas, directo del apicultor.',ARRAY['miel','polen','apicultura'],'56912340002','jorge@mielrobles.cl','@mielosrobles',NULL,true,318,25),
 ('telar-de-parral','Telar de Parral','Marisol Fuentes','Artesanía','Parral','Textiles en telar mapuche y lana natural teñida con plantas.','Cada pieza es única y toma semanas de trabajo. Enseño telar a mujeres de la comuna y armamos pedidos colectivos.','Artesanía textil con tintes naturales y diseño contemporáneo.',ARRAY['telar','lana','tintes naturales'],'56912340003','marisol@telardeparral.cl','@telardeparral',NULL,true,276,19),
 ('viña-santa-ana','Viña Santa Ana','Rodrigo Alarcón','Turismo','San Javier','Tours enológicos y degustaciones en el valle del Loncomilla.','Viña familiar con 30 hectáreas. Ofrecemos visitas guiadas, picnic entre parras y experiencias para grupos pequeños.','Turismo de vino cercano, sin protocolos rígidos.',ARRAY['vino','tours','experiencias'],'56912340004','hola@vinasantaana.cl','@vinasantaana','https://vinasantaana.cl',true,530,44),
 ('estudio-raiz','Estudio Raíz','Camila Torres','Diseño','Linares','Diseño de marca e identidad visual para emprendimientos locales.','Ayudo a emprendedores del Maule a ordenar su marca: logo, paleta, piezas para redes y etiquetas de producto.','Marcas con identidad local y estándar profesional.',ARRAY['branding','logo','packaging'],'56912340005','camila@estudioraiz.cl','@estudioraiz','https://estudioraiz.cl',false,198,21),
 ('panaderia-la-espiga','Panadería La Espiga','Luis Cornejo','Gastronomía','Villa Alegre','Pan de masa madre y repostería tradicional del Maule.','Horneamos todos los días con harina molida en Yerbas Buenas. Nuestro pan de masa madre fermenta 24 horas.','Pan honesto, fermentación lenta, ingredientes simples.',ARRAY['pan','masa madre','pastelería'],'56912340006','laespiga@correo.cl','@panaderialaespiga',NULL,false,241,17),
 ('huerto-vivo','Huerto Vivo','Andrea Rojas','Agricultura','Yerbas Buenas','Verduras agroecológicas y cajas semanales a domicilio.','Cultivamos sin agroquímicos en media hectárea y entregamos cajas de temporada en Linares y Yerbas Buenas.','Verdura fresca cosechada el mismo día del despacho.',ARRAY['agroecología','cajas','delivery'],'56912340007','huertovivo@correo.cl','@huertovivo.maule',NULL,false,187,14),
 ('taller-madera-sur','Taller Madera Sur','Patricio Vega','Hogar','Colbún','Muebles a medida en madera nativa recuperada.','Rescatamos maderas de construcciones antiguas y las convertimos en mesas, repisas y muebles de cocina.','Muebles duraderos con historia y materia prima recuperada.',ARRAY['muebles','madera','a medida'],'56912340008','contacto@maderasur.cl','@tallermaderasur',NULL,false,163,11),
 ('bella-raiz','Bella Raíz','Fernanda Salas','Belleza','Cauquenes','Cosmética natural elaborada con aceites y hierbas del secano.','Formulo jabones, bálsamos y aceites con recetas propias y envases retornables.','Cosmética natural, sin plástico de un solo uso.',ARRAY['cosmética','jabones','natural'],'56912340009','fernanda@bellaraiz.cl','@bellaraiz.cl',NULL,false,209,16),
 ('maule-digital','Maule Digital','Ignacio Peña','Tecnología','Parral','Sitios web, tiendas online y soporte digital para pymes rurales.','Acompaño a emprendimientos que quieren vender fuera de su comuna: web, catálogo y capacitación básica.','Tecnología explicada en simple, sin tecnicismos.',ARRAY['web','ecommerce','soporte'],'56912340010','ignacio@mauledigital.cl','@mauledigital','https://mauledigital.cl',false,152,13),
 ('ruta-costa-chanco','Ruta Costa Chanco','Valentina Ortiz','Turismo','Chanco','Cabalgatas y recorridos guiados por bosques y dunas de Chanco.','Trabajo con guías locales para mostrar la Reserva Federico Albert y la costa maulina de forma responsable.','Turismo de naturaleza con guías de la propia comuna.',ARRAY['cabalgatas','naturaleza','guías'],'56912340011','ruta@costachanco.cl','@rutacostachanco',NULL,false,231,18),
 ('transportes-el-alba','Transportes El Alba','Héctor Norambuena','Transporte','Retiro','Traslado de carga y distribución para emprendedores del Maule Sur.','Consolidamos pedidos de varios emprendedores para abaratar el flete hacia Talca y Santiago.','Flete compartido y económico entre emprendedores.',ARRAY['carga','flete','logística'],'56912340012','contacto@elalba.cl','@transporteselalba',NULL,false,124,9)
) AS v(slug,business_name,owner_name,cat,com,short_description,about,value_prop,tags,whatsapp,email,instagram,website,featured,views,contacts)
JOIN public.categories c ON c.name = v.cat
JOIN public.comunas m ON m.name = v.com;

INSERT INTO public.products (entrepreneur_id, name, description, image_url, info, sort_order)
SELECT e.id, p.name, p.description, 'https://picsum.photos/seed/' || e.slug || '-' || p.sort_order || '/800/600', p.info, p.sort_order
FROM (VALUES
 ('sabores-del-maule','Mermelada de frambuesa','Frasco de 250 g con fruta de temporada.','Desde $3.500',1),
 ('sabores-del-maule','Caja degustación','Cuatro conservas surtidas para regalo.','Desde $12.000',2),
 ('miel-los-robles','Miel multifloral 1 kg','Cosecha del secano de Longaví.','Desde $8.000',1),
 ('telar-de-parral','Manta en telar','Lana natural teñida con plantas.','A pedido',1),
 ('vina-santa-ana','Tour y degustación','Recorrido guiado con tres vinos.','Por persona',1),
 ('estudio-raiz','Kit de marca','Logo, paleta y piezas para redes.','Plan básico',1),
 ('panaderia-la-espiga','Pan de masa madre','Hogaza de 800 g, fermentación 24 h.','Diario',1),
 ('huerto-vivo','Caja de verduras','8 a 10 variedades de temporada.','Semanal',1),
 ('taller-madera-sur','Mesa de comedor','Madera nativa recuperada, a medida.','A pedido',1),
 ('bella-raiz','Jabón de caléndula','Elaborado en frío, envase compostable.','Unidad',1),
 ('maule-digital','Sitio web para pyme','Catálogo, contacto y WhatsApp integrado.','Plan inicial',1),
 ('ruta-costa-chanco','Cabalgata a las dunas','Recorrido de 3 horas con guía.','Por persona',1),
 ('transportes-el-alba','Flete compartido','Ruta semanal Maule Sur - Talca.','Por bulto',1)
) AS p(slug,name,description,info,sort_order)
JOIN public.entrepreneurs e ON e.slug = replace(p.slug,'vina-santa-ana','viña-santa-ana');

INSERT INTO public.events (slug, title, description, image_url, starts_at, location, organizer, registration_url) VALUES
 ('feria-vitrina-linares','Feria La Vitrina Linares','Feria de emprendedores del Maule Sur con música en vivo y food trucks.','https://picsum.photos/seed/feria-linares/1200/800', now() + interval '20 days','Plaza de Armas, Linares','La Vitrina','https://ejemplo.cl/inscripcion'),
 ('taller-redes-sociales','Taller: vende por Instagram','Taller práctico de contenido y ventas para emprendedores.','https://picsum.photos/seed/taller-redes/1200/800', now() + interval '9 days','Centro Cultural, Parral','Maule Digital','https://ejemplo.cl/taller'),
 ('encuentro-networking','Encuentro de networking Maule Sur','Ronda de presentaciones y alianzas entre emprendedores.','https://picsum.photos/seed/networking/1200/800', now() + interval '35 days','Casona San Javier','La Vitrina',NULL);

INSERT INTO public.radio_items (title, kind, description, image_url, media_url, published_at) VALUES
 ('Programa #48: emprender en el secano','programa','Conversamos con productores de Cauquenes y Chanco sobre agua y asociatividad.','https://picsum.photos/seed/radio48/1200/800',NULL, now() - interval '3 days'),
 ('Entrevista: Carolina Muñoz, Sabores del Maule','entrevista','De la cocina de casa a las cafeterías de Linares.','https://picsum.photos/seed/radio-carolina/1200/800',NULL, now() - interval '10 days'),
 ('Cápsula: cómo poner precio a tu producto','capsula','Tres minutos con claves simples de costeo.','https://picsum.photos/seed/radio-capsula/1200/800',NULL, now() - interval '17 days');

INSERT INTO public.weekly_features (entrepreneur_id, week_start, story)
SELECT e.id, date_trunc('week', now())::date, 'Carolina empezó vendiendo mermeladas en la feria de Linares. Hoy abastece cafeterías de tres comunas y compra fruta a seis productores vecinos. Su historia abrió el último programa de La Vitrina.'
FROM public.entrepreneurs e WHERE e.slug = 'sabores-del-maule';
