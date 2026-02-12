import { StyleSheet } from "react-native"

// Просмотр отдельной записи дневника
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  moodDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  entryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryContent: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  metaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalForm: {
    maxHeight: 500,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  moodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodOption: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  moodOptionSelected: {
    backgroundColor: '#f9fff9',
  },
  moodOptionEmoji: {
    fontSize: 24,
  },
  moodOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  contentInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 150,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  modalButtonCancelText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonSave: {
    backgroundColor: '#2ecc71',
  },
  modalButtonSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles