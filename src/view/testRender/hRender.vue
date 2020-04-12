<script>
export default {
  data() {
    return {};
  },
  mounted() {
    const { test, visible } = this.parentAttrs || {};
    const { click } = this.parentListeners || {};
    click && click();
    console.log(test, "test", visible);
  },
  render(createElement) {
    return createElement(
      "h" + this.level,
      {
        //   scopedSlots: {
        //     default: props => createElement("span", props.level)
        //   },
        style: {
          color: "red"
        }
      },
      this.$slots.default
    );
  },
  props: {
    level: {
      type: Number,
      required: true
    },
    parentListeners: {
      type: Object
    },
    parentAttrs: {
      type: Object
    }
  }
};
</script>