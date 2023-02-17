const apiUrl = "https://vue3-course-api.hexschool.io/";
const path = "masaki";

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const productModal = {
  //當id變動時，取得遠端資料，並呈現modal
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      tempProduct: {},
      modal: {},
      qty: 1,
    };
  },
  template: "#userProductModal",
  watch: {
    id() {
      if (this.id) {
        axios
          .get(`${apiUrl}v2/api/${path}/product/${this.id}`)
          .then((res) => {
            this.tempProduct = res.data.product;
            this.modal.show();
          })
          .catch((err) => {
            console.log(err.data.message);
          });
      }
    },
  },
  methods: {
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
    // 監聽DOM，當MODAL 關閉時 要做其他事情
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      this.openModal("");
    });
  },
};

const { createApp } = Vue;

const App = Vue.createApp({
  data() {
    return {
      text: "有",
      product: [],
      productId: "",
      cart: {},
      loadingItem: "",
      data: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
      isLoading: true,
    };
  },
  methods: {
    getProduct() {
      axios
        .get(`${apiUrl}v2/api/${path}/products`)
        .then((res) => {
          this.product = res.data.products;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    openModal(id) {
      this.productId = id;
      console.log("外層帶入的");
    },
    addToCart(product_id, qty = 1) {
      const data = {
        product_id,
        qty,
      };
      axios
        .post(`${apiUrl}v2/api/${path}/cart`, { data })
        .then((res) => {
          this.$refs.productModal.hide();
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    getCart(product_id, qty = 1) {
      axios
        .get(`${apiUrl}v2/api/${path}/cart`)
        .then((res) => {
          this.cart = res.data.data;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    updateCartItem(item) {
      //產品的id , 購物車的id
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      };
      this.loadingItem = item.id;
      axios
        .put(`${apiUrl}v2/api/${path}/cart/${item.id}`, { data })
        .then((res) => {
          this.getCart();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    deleteItem(item) {
      this.loadingItem = item.id;
      axios
        .delete(`${apiUrl}v2/api/${path}/cart/${item.id}`)
        .then((res) => {
          this.getCart();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    onSubmit() {
      const data = this.data;
      axios
        .post(`${apiUrl}v2/api/${path}/order`, { data })
        .then((res) => {
          alert(res.data.message);
          // 將表單資料清空
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
  },
  mounted() {
    this.getProduct();
    this.getCart();
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  },
});

App.component("loading", VueLoading.Component);
App.component("VForm", VeeValidate.Form);
App.component("VField", VeeValidate.Field);
App.component("ErrorMessage", VeeValidate.ErrorMessage);

App.component("productModal", productModal);

App.mount("#app");
