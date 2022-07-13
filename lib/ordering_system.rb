class OrderingSystem
  def initialize #(&the_compare_proc)
    #@semaphore = semaphore
    #@compare_proc = the_compare_proc
    reset!
  end

  def items
    @items.collect { |k| @item_components[k] }
  end

  def reset!
    #@semaphore.synchronize {
      @items = []
      @item_components = {}
      @i = 0
    #}
  end

  def order_by(cmp, container, key, component)
    @item_components[key] = component

    ## Iterate through the length of the array, push into method
    if @i == 0
      @items[@i] = key
    else
      ## beginning with the second element items[i]
      j = @i - 1

      # If element to left of key is larger then
      # move it one position over at a time
      while j >= 0 and foo(cmp, container, @item_components[@items[j]], component)
        @items[j + 1] = @items[j]
        j = j - 1
      end

      # Update key position
      @items[j+1] = key
    end

    @i += 1
  end

  def foo(cmp, container, a, b)
    case cmp
      when :x
        left = a[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| ((container[:dimensions][0] * bin_index.to_f) + placement[:position][0] + placement[:dimensions][0]) } }.flatten
        right = b[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| ((container[:dimensions][0] * bin_index.to_f) + placement[:position][0] + placement[:dimensions][0]) } }.flatten
        left.max > right.max
      when :y
        left = a[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| (placement[:position][1] + placement[:dimensions][1]) } }.flatten
        right = b[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| (placement[:position][1] + placement[:dimensions][1]) } }.flatten
        left.max > right.max
     when :z
        left = a[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| (placement[:position][2] + placement[:dimensions][2]) } }.flatten
        right = b[:packings].each_with_index.collect { |packing, bin_index| packing[:placements].collect { |placement| (placement[:position][2] + placement[:dimensions][2]) } }.flatten
        left.max > right.max
    else
      raise "wtf #{cmp}"
    end
  end
end
