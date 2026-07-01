import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { PigeonWhatsAppEditor } from '@lit-pigeon/whatsapp-editor';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';

/**
 * Vue wrapper for `<pigeon-whatsapp-editor>`.
 *
 * The `template` prop is bound to the element's DOM property, and the
 * `pigeon:change` CustomEvent is re-emitted as a Vue `change` event carrying
 * the updated template.
 *
 * @example
 * ```vue
 * <WhatsAppEditor :template="template" @change="onChange" />
 * ```
 */
export const WhatsAppEditor = defineComponent({
  name: 'WhatsAppEditor',
  props: {
    template: { type: Object as () => WhatsAppTemplate, default: undefined },
  },
  emits: {
    change: (_template: WhatsAppTemplate) => true,
  },
  setup(props, { emit }) {
    const elRef = ref<PigeonWhatsAppEditor>();

    const onChange = (event: Event) => {
      emit('change', (event as CustomEvent<{ template: WhatsAppTemplate }>).detail.template);
    };

    onMounted(() => {
      const el = elRef.value;
      if (!el) return;
      if (props.template) el.template = props.template;
      el.addEventListener('pigeon:change', onChange);
    });

    onBeforeUnmount(() => {
      elRef.value?.removeEventListener('pigeon:change', onChange);
    });

    watch(
      () => props.template,
      (next) => {
        if (elRef.value && next) elRef.value.template = next;
      },
    );

    return () => h('pigeon-whatsapp-editor', { ref: elRef });
  },
});

export default WhatsAppEditor;
