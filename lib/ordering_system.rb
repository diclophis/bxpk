class OrderingSystem
  def initialize(semaphore = Mutex.new, &the_compare_proc)
    @semaphore = semaphore
    @compare_proc = the_compare_proc
    reset!
  end

  def items
    @items.collect { |k| @item_components[k] }
  end

  def reset!
    @semaphore.synchronize {
      @items = []
      @item_components = {}
      @i = 0
    }
  end

  def order_by(key, component)
    @semaphore.synchronize {
      @item_components[key] = component

      ## Iterate through the length of the array, push into method
      if @i == 0
        @items[@i] = key
      else
        ## beginning with the second element items[i]
        j = @i - 1

        # If element to left of key is larger then
        # move it one position over at a time
        while j >= 0 and @compare_proc.call(@item_components[@items[j]], component)
          @items[j + 1] = @items[j]
          j = j - 1
        end

        # Update key position
        @items[j+1] = key
      end

      @i += 1
    }
  end
end
