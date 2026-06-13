<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Add New Property Listing" 
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Title/Code -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Listing Title *</label>
        <input 
          v-model="title" 
          type="text" 
          placeholder="e.g. Skyway Tower - Unit 802"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.title ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.title" class="text-[9px] text-red-500 mt-1 block">{{ errors.title }}</span>
      </div>

      <!-- Project (Searchable Dropdown) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Development Project *</label>
        <select 
          v-model="projectId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.projectId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Project</option>
          <option v-for="proj in projects" :key="proj._id || proj.id" :value="proj._id || proj.id">
            {{ proj.name }} ({{ proj.city }})
          </option>
        </select>
        <span v-if="errors.projectId" class="text-[9px] text-red-500 mt-1 block">{{ errors.projectId }}</span>
      </div>

      <!-- Tower & Unit Number -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tower / Block *</label>
          <input 
            v-model="towerBlock" 
            type="text" 
            placeholder="e.g. Tower A"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.towerBlock ? 'border-red-500' : 'border-default'"
            @blur="checkUniqueness"
          />
          <span v-if="errors.towerBlock" class="text-[9px] text-red-500 mt-1 block">{{ errors.towerBlock }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Number *</label>
          <input 
            v-model="unitNumber" 
            type="text" 
            placeholder="e.g. 802"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.unitNumber ? 'border-red-500' : 'border-default'"
            @blur="checkUniqueness"
          />
          <span v-if="errors.unitNumber" class="text-[9px] text-red-500 mt-1 block">{{ errors.unitNumber }}</span>
        </div>
      </div>
      <span v-if="uniquenessError" class="text-[9px] text-red-500 block font-bold">{{ uniquenessError }}</span>

      <!-- Floor Numbers -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Level *</label>
          <input 
            v-model.number="floorNumber" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.floorNumber ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.floorNumber" class="text-[9px] text-red-500 mt-1 block">{{ errors.floorNumber }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Floors *</label>
          <input 
            v-model.number="totalFloors" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.totalFloors ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.totalFloors" class="text-[9px] text-red-500 mt-1 block">{{ errors.totalFloors }}</span>
        </div>
      </div>

      <!-- Config & Type -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Type *</label>
          <select 
            v-model="type" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
            <option value="office">Office</option>
            <option value="shop">Shop</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">BHK Configuration *</label>
          <select 
            v-model.number="bhk" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option :value="1">1 BHK</option>
            <option :value="2">2 BHK</option>
            <option :value="3">3 BHK</option>
            <option :value="4">4 BHK</option>
            <option :value="5">5 BHK</option>
          </select>
        </div>
      </div>

      <!-- Super vs Carpet Areas -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Super Area (sqft) *</label>
          <input 
            v-model.number="superArea" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.superArea ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.superArea" class="text-[9px] text-red-500 mt-1 block">{{ errors.superArea }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Carpet Area (sqft) *</label>
          <input 
            v-model.number="carpetArea" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.carpetArea ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.carpetArea" class="text-[9px] text-red-500 mt-1 block">{{ errors.carpetArea }}</span>
        </div>
      </div>

      <!-- Pricing details -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Price (INR) *</label>
          <input 
            v-model.number="basePrice" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.basePrice ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.basePrice" class="text-[9px] text-red-500 mt-1 block">{{ errors.basePrice }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Facing Parameter</label>
          <select 
            v-model="facing" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="north-east">North-East</option>
            <option value="north-west">North-West</option>
            <option value="south-east">South-East</option>
            <option value="south-west">South-West</option>
          </select>
        </div>
      </div>

      <!-- Seller Link -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Seller Entity Owner *</label>
        <select 
          v-model="sellerId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.sellerId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Seller</option>
          <option v-for="sel in sellers" :key="sel._id || sel.id" :value="sel._id || sel.id">
            {{ sel.name }} ({{ sel.phone }})
          </option>
        </select>
        <span v-if="errors.sellerId" class="text-[9px] text-red-500 mt-1 block">{{ errors.sellerId }}</span>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks & Details</label>
        <textarea 
          v-model="description" 
          rows="2"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button 
        @click="onSubmit"
        :disabled="isPending || !!uniquenessError"
        class="btn-md btn-primary"
      >
        Save Property
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';
import { useCreatePropertyMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const schema = toTypedSchema(
  zod.object({
    title: zod.string().min(2, 'Title must contain at least 2 characters').max(150),
    projectId: zod.string().min(1, 'Project selection is required'),
    towerBlock: zod.string().min(1, 'Tower code is required'),
    unitNumber: zod.string().min(1, 'Unit number is required'),
    floorNumber: zod.number().min(0, 'Floor must be greater than or equal to 0'),
    totalFloors: zod.number().min(1, 'Total floors must be at least 1'),
    superArea: zod.number().min(1, 'Super area is required'),
    carpetArea: zod.number().min(1, 'Carpet area is required'),
    basePrice: zod.number().min(10000, 'Price must be realistic'),
    sellerId: zod.string().min(1, 'Seller reference is required')
  }).refine(data => data.superArea >= data.carpetArea, {
    message: 'Super Built-Up Area must be greater than or equal to Carpet Area',
    path: ['superArea']
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    projectId: '',
    towerBlock: '',
    unitNumber: '',
    floorNumber: 0,
    totalFloors: 1,
    superArea: 0,
    carpetArea: 0,
    basePrice: 0,
    sellerId: ''
  }
});

const { value: title } = useField('title');
const { value: projectId } = useField('projectId');
const { value: towerBlock } = useField('towerBlock');
const { value: unitNumber } = useField('unitNumber');
const { value: floorNumber } = useField('floorNumber');
const { value: totalFloors } = useField('totalFloors');
const { value: superArea } = useField('superArea');
const { value: carpetArea } = useField('carpetArea');
const { value: basePrice } = useField('basePrice');
const { value: sellerId } = useField('sellerId');

const facing = ref('east');
const type = ref('apartment');
const bhk = ref(2);
const description = ref('');

const projects = ref([]);
const sellers = ref([]);
const uniquenessError = ref('');

const loadContextData = async () => {
  try {
    const [projRes, selRes] = await Promise.all([
      apiClient.get('/projects/projects'),
      apiClient.get('/sellers')
    ]);
    projects.value = projRes.data?.data || [];
    sellers.value = selRes.data?.data || [];
  } catch (err) {
    console.error('Failed to load properties context details:', err);
  }
};

onMounted(loadContextData);

const checkUniqueness = async () => {
  uniquenessError.value = '';
  if (!projectId.value || !towerBlock.value || !unitNumber.value) return;
  
  try {
    // Check if unit number already exists in this tower for the project
    const unitsRes = await apiClient.get('/projects/units', {
      params: { 
        projectId: projectId.value, 
        unitNumber: unitNumber.value 
      }
    });
    const match = unitsRes.data?.data?.find(u => u.unitNumber === unitNumber.value);
    if (match) {
      uniquenessError.value = `Unit ${unitNumber.value} on ${towerBlock.value} already exists in this project.`;
    }
  } catch (error) {
    console.warn('Failed uniqueness validation check', error);
  }
};

const { mutateAsync: createProperty, isPending } = useCreatePropertyMutation();

const onSubmit = handleSubmit(async (values) => {
  if (uniquenessError.value) return;

  const payload = {
    title: values.title,
    description: description.value || undefined,
    type: type.value,
    seller: values.sellerId,
    project: values.projectId,
    price: values.basePrice,
    location: {
      city: projects.value.find(p => p._id === values.projectId)?.city || ''
    },
    area: {
      carpet: values.carpetArea,
      superBuiltUp: values.superArea,
      unit: 'sqft'
    },
    bhk: bhk.value,
    floors: values.floorNumber,
    totalFloors: values.totalFloors,
    facing: facing.value,
    status: 'available'
  };

  try {
    // Simultaneously create unit database link & property listing
    await createProperty(payload);
    
    // Resolve or create Tower
    let towerIdResolved = '';
    try {
      const towersRes = await apiClient.get('/projects/towers', {
        params: { projectId: values.projectId }
      });
      const existingTowers = towersRes.data?.data || [];
      const match = existingTowers.find(t => t.name.toLowerCase().trim() === values.towerBlock.toLowerCase().trim());
      if (match) {
        towerIdResolved = match._id || match.id;
      } else {
        const towerCode = values.towerBlock.trim().replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().substring(0, 20) || 'TOWER';
        const newTowerRes = await apiClient.post('/projects/towers', {
          projectId: values.projectId,
          name: values.towerBlock.trim(),
          code: towerCode
        });
        const newTower = newTowerRes.data?.data || newTowerRes.data;
        towerIdResolved = newTower._id || newTower.id;
      }
    } catch (err) {
      console.warn('Failed to resolve or create tower, falling back', err);
    }

    if (towerIdResolved) {
      // Also create unit in Project database
      await apiClient.post('/projects/units', {
        projectId: values.projectId,
        towerId: towerIdResolved,
        unitNumber: values.unitNumber,
        configuration: type.value === 'apartment' ? `${bhk.value}BHK` : type.value,
        carpetArea: values.carpetArea,
        builtUpArea: values.superArea,
        price: values.basePrice
      }).catch(err => console.warn('Sync unit creation skipped', err));
    } else {
      console.warn('Sync unit creation skipped: towerId could not be resolved.');
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Property listing created successfully.',
      type: 'success'
    });

    resetForm();
    description.value = '';
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to create property.',
      type: 'error'
    });
  }
});
</script>
