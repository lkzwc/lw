// components/skill-card/skill-card.js
const config = require('../../utils/config')

Component({
  properties: {
    skill: {
      type: Object,
      value: {}
    }
  },

  data: {
    categoryIcon: '📋'
  },

  observers: {
    'skill.category': function (category) {
      const cat = config.skillCategories.find(c => c.id === category)
      this.setData({
        categoryIcon: cat ? cat.icon : '📋'
      })
    }
  },

  methods: {
    // 点击卡片进入详情
    onTap: function (e) {
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/skill-detail/skill-detail?id=${id}`
      })
    }
  }
})