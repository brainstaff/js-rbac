CREATE TABLE rbac_items
(
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rule character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT rbac_items_pkey PRIMARY KEY (name)
);

CREATE TABLE rbac_item_children
(
    parent character varying(255) COLLATE pg_catalog."default" NOT NULL,
    child character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT rbac_item_children_pkey PRIMARY KEY (parent, child),
    CONSTRAINT rbac_item_children_rbac_items_child_fk FOREIGN KEY (child)
        REFERENCES rbac_items (name) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT rbac_item_children_rbac_items_parent_fk FOREIGN KEY (parent)
        REFERENCES rbac_items (name) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE rbac_assignments
(
    "userId" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT rbac_assignments_pkey PRIMARY KEY ("userId", role),
    CONSTRAINT rbac_assignments_rbac_items_fk FOREIGN KEY (role)
        REFERENCES rbac_items (name) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE TABLE rbac_rules
(
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT rbac_rules_pkey PRIMARY KEY (name)
);
